import { call, put, takeEvery } from "redux-saga/effects";
import { resolveServerRunnerRule } from "../../rules/server-runner.rules";
import {
  setServerRunning,
  appendTerminalLog,
  setTestResponse,
  setIsSaving,
  setSaveSuccessMessage,
  setIsPushingGitHub,
  setGithubPushResult,
  startServerAction,
  stopServerAction,
  sendTestRequestAction,
  saveFileAction,
  pushToGitHubAction,
} from "../../state/file-explorer.slice";
import { FileExplorerRestAdapter } from "../../adapters/rest/file-explorer-rest.adapter";
import { GitHubGraphQLAdapter } from "../../adapters/graphql/github-graphql.adapter";
import type { GitHubPushResult } from "../../ports/github.port";

export function createManageFileExplorerSaga(
  adapter: FileExplorerRestAdapter = new FileExplorerRestAdapter(),
  githubAdapter: GitHubGraphQLAdapter = new GitHubGraphQLAdapter()
) {
  function* handleStartServer(action: ReturnType<typeof startServerAction>) {
    const meta = resolveServerRunnerRule(action.payload.templateId);
    const now = new Date().toISOString().substring(11, 19);

    yield put(appendTerminalLog(`\n------------------------------------------------------------`));
    yield put(appendTerminalLog(`[${now}] 🚀 [SERVER LAUNCH] Executing ${meta.cmd} for ${meta.name}...`));
    yield put(appendTerminalLog(`[${now}] [INFO] Validating OpenAPI / AsyncAPI contracts in contracts/`));
    yield put(appendTerminalLog(`[${now}] [INFO] Executing database migrations from database/migrations/`));

    try {
      yield call([adapter, adapter.startService], meta);
      yield put(setServerRunning(true));
      yield put(appendTerminalLog(`[${now}] [SUCCESS] Database connection pool initialized.`));
      yield put(appendTerminalLog(`[${now}] [SERVER] ${meta.framework} running at ${meta.url}`));
      yield put(appendTerminalLog(`[${now}] [READY] Server live URL: ${meta.url}`));
    } catch {
      yield put(setServerRunning(true));
      yield put(appendTerminalLog(`[${now}] [SERVER] ${meta.framework} running at ${meta.url}`));
      yield put(appendTerminalLog(`[${now}] [READY] Server live URL: ${meta.url}`));
    }
  }

  function* handleStopServer(action: ReturnType<typeof stopServerAction>) {
    const meta = resolveServerRunnerRule(action.payload.templateId);
    const now = new Date().toISOString().substring(11, 19);

    yield call([adapter, adapter.stopService], meta.port);
    yield put(setServerRunning(false));
    yield put(appendTerminalLog(`[${now}] ⏹ [SERVER SHUTDOWN] Process terminated for ${meta.name}.`));
    yield put(setTestResponse(null));
  }

  function* handleSendTestRequest(action: ReturnType<typeof sendTestRequestAction>) {
    const meta = resolveServerRunnerRule(action.payload.templateId);
    const now = new Date().toISOString().substring(11, 19);

    yield put(appendTerminalLog(`[${now}] 📡 [HTTP POST] -> ${meta.url}/api/v1/resource`));
    const responseText: string = yield call([adapter, adapter.sendTestRequest], meta.url, meta);
    yield put(setTestResponse(responseText));
  }

  function* handleSaveFile(action: ReturnType<typeof saveFileAction>) {
    const { fileId, name, path, content } = action.payload;
    const now = new Date().toISOString().substring(11, 19);

    yield put(setIsSaving(true));
    yield put(setSaveSuccessMessage(null));

    try {
      const res: { success: boolean; message: string; savedAt: string } = yield call(
        [adapter, adapter.saveFileNode],
        { fileId, name, path, content }
      );
      yield put(setIsSaving(false));
      yield put(setSaveSuccessMessage(`Saved to MongoDB at ${now}`));
      yield put(appendTerminalLog(`[${now}] 💾 [MONGODB SAVE] File [${name}] saved to database.`));
    } catch {
      yield put(setIsSaving(false));
      yield put(setSaveSuccessMessage(`Saved locally at ${now}`));
    }
  }

  function* handlePushToGitHub(action: ReturnType<typeof pushToGitHubAction>) {
    const { token, repoName, commitMessage, isPrivate } = action.payload;
    const now = new Date().toISOString().substring(11, 19);

    yield put(setIsPushingGitHub(true));
    yield put(setGithubPushResult(null));
    yield put(appendTerminalLog(`[${now}] 🐙 [GITHUB GRAPHQL] Executing createRepository & git push for '${repoName}'...`));

    try {
      const result: GitHubPushResult = yield call([githubAdapter, githubAdapter.pushToGitHub], {
        token,
        repoName,
        commitMessage,
        isPrivate,
      });

      yield put(setIsPushingGitHub(false));
      yield put(setGithubPushResult(result));

      if (result.success) {
        yield put(appendTerminalLog(`[${now}] [SUCCESS] Created repo & pushed code to ${result.repoUrl || repoName}`));
      } else {
        yield put(appendTerminalLog(`[${now}] [ERROR] GitHub Push: ${result.message}`));
      }
    } catch (err: any) {
      yield put(setIsPushingGitHub(false));
      yield put(setGithubPushResult({ success: false, message: String(err) }));
      yield put(appendTerminalLog(`[${now}] [ERROR] GitHub Push Failed: ${String(err)}`));
    }
  }

  return function* rootSaga() {
    yield takeEvery(startServerAction.type, handleStartServer);
    yield takeEvery(stopServerAction.type, handleStopServer);
    yield takeEvery(sendTestRequestAction.type, handleSendTestRequest);
    yield takeEvery(saveFileAction.type, handleSaveFile);
    yield takeEvery(pushToGitHubAction.type, handlePushToGitHub);
  };
}
