import { call, put, takeLatest } from "redux-saga/effects";
import { dockerLabSlice } from "../../state/docker-lab.slice";
import type { DockerLabPort } from "../../ports/docker-lab.port";
import type {
  ExecutionResult,
  TestResult,
  LogLine
} from "../../domain/entities/docker-image.entity";

export function createManageDockerLabSaga(repository: DockerLabPort) {
  function* executeWorker(action: ReturnType<typeof dockerLabSlice.actions.executeRequested>) {
    try {
      const res: ExecutionResult = yield call([repository, repository.executeImage], action.payload);
      yield put(dockerLabSlice.actions.executeSucceeded(res));
    } catch (err: unknown) {
      yield put(dockerLabSlice.actions.executeFailed(err instanceof Error ? err.message : String(err)));
    }
  }

  function* testWorker(action: ReturnType<typeof dockerLabSlice.actions.testRequested>) {
    try {
      const { containerId, probeType, port, path } = action.payload;
      const res: TestResult = yield call([repository, repository.testContainer], containerId, probeType, port, path);
      yield put(dockerLabSlice.actions.testSucceeded(res));
    } catch (err: unknown) {
      yield put(dockerLabSlice.actions.testFailed(err instanceof Error ? err.message : String(err)));
    }
  }

  function* logsWorker(action: ReturnType<typeof dockerLabSlice.actions.logsRequested>) {
    try {
      const logs: LogLine[] = yield call([repository, repository.getLogs], action.payload);
      yield put(dockerLabSlice.actions.logsSucceeded({ containerId: action.payload, logs }));
    } catch {}
  }

  function* stopWorker(action: ReturnType<typeof dockerLabSlice.actions.stopRequested>) {
    try {
      const { containerId, backup } = action.payload;
      const success: boolean = yield call(() => repository.stopContainer(containerId, backup));
      if (success) {
        yield put(dockerLabSlice.actions.stopSucceeded(containerId));
      } else {
        yield put(dockerLabSlice.actions.stopFailed("Failed to stop container"));
      }
    } catch (err: unknown) {
      yield put(dockerLabSlice.actions.stopFailed(err instanceof Error ? err.message : String(err)));
    }
  }

  return function* manageDockerLabSaga() {
    yield takeLatest(dockerLabSlice.actions.executeRequested.type, executeWorker);
    yield takeLatest(dockerLabSlice.actions.testRequested.type, testWorker);
    yield takeLatest(dockerLabSlice.actions.logsRequested.type, logsWorker);
    yield takeLatest(dockerLabSlice.actions.stopRequested.type, stopWorker);
  };
}
