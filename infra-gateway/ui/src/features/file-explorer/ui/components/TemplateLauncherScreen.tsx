import React, { useState, useEffect } from "react";
import {
  FolderTree,
  Rocket,
  Sparkles,
  Layers,
  CheckCircle2,
  Code2,
  ArrowRight,
  ShieldCheck,
  Play,
  Download,
} from "lucide-react";
import { PROJECT_TEMPLATES_CATALOG } from "../../domain/project-templates.catalog";
import { evaluateFolderStructurePolicy, type FolderStructureRuleResult } from "../../rules/file-explorer.rules";
import { generateSetupShellScript, triggerFileDownload } from "../../utils/download-structure.utils";
import type { TreeItem } from "../../domain/entities/file-node.entity";

interface TemplateLauncherScreenProps {
  onLaunch: (templateId: string, customTree?: TreeItem[]) => void;
}

export const TemplateLauncherScreen: React.FC<TemplateLauncherScreenProps> = ({
  onLaunch,
}) => {
  const [selectedId, setSelectedId] = useState<string>(PROJECT_TEMPLATES_CATALOG[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [ruleResults, setRuleResults] = useState<FolderStructureRuleResult[]>([]);
  const [customJson, setCustomJson] = useState<string>(`[
  {
    "id": "root-custom",
    "name": "my-custom-project",
    "type": "folder",
    "path": "my-custom-project",
    "parentId": null,
    "badge": "folder",
    "isExpanded": true,
    "children": [
      {
        "id": "src-folder",
        "name": "src",
        "type": "folder",
        "path": "my-custom-project/src",
        "parentId": "root-custom",
        "badge": "src",
        "isExpanded": true,
        "children": [
          {
            "id": "main-ts",
            "name": "index.ts",
            "type": "file",
            "path": "my-custom-project/src/index.ts",
            "parentId": "src-folder",
            "badge": "ts",
            "content": "console.log('Hello Custom Workspace!');"
          }
        ]
      }
    ]
  }
]`);
  const [activeTab, setActiveTab] = useState<"catalog" | "custom">("catalog");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const filteredTemplates = PROJECT_TEMPLATES_CATALOG.filter((t) => {
    if (selectedLanguage === "all") return true;
    return t.language === selectedLanguage;
  });

  const selectedTemplate =
    PROJECT_TEMPLATES_CATALOG.find((t) => t.id === selectedId) || PROJECT_TEMPLATES_CATALOG[0];

  useEffect(() => {
    if (selectedTemplate && selectedTemplate.tree) {
      evaluateFolderStructurePolicy(selectedTemplate.tree)
        .then(setRuleResults)
        .catch(() => setRuleResults([]));
    }
  }, [selectedId, selectedTemplate]);

  const handleLaunchCatalog = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onLaunch(selectedId);
  };

  const handleLaunchCustom = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const parsed = JSON.parse(customJson);
      if (!Array.isArray(parsed)) {
        setJsonError("Custom JSON must be an array of root TreeItem nodes.");
        return;
      }
      setJsonError(null);
      onLaunch("custom-json", parsed);
    } catch (err: any) {
      setJsonError(`Invalid JSON format: ${err.message}`);
    }
  };

  const handleDownloadTemplateScript = (template: typeof selectedTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    const script = generateSetupShellScript(template.tree, template.rootFolderName);
    triggerFileDownload(`${template.rootFolderName}-setup.sh`, script, "application/x-sh");
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6 bg-[#181818] border border-[#2b2b2b] rounded-2xl shadow-2xl text-white">
      <div className="text-center max-w-2xl mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-xs font-mono font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>LANGUAGE-BASED RULE ENGINE FOLDER GENERATOR</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Select Language & Folder Structure
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Filter by programming language (TypeScript, Node.js, Python, Gateway). Each structure includes full code algorithms, SQL migrations, Docker setup, and tests.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {[
          { id: "all", label: "All Languages" },
          { id: "typescript", label: "TypeScript / Next.js 15" },
          { id: "node", label: "Node.js / Express" },
          { id: "python", label: "Python / FastAPI" },
          { id: "gateway", label: "Infrastructure Gateway" },
          { id: "universal", label: "Universal Architecture" },
        ].map((lang) => (
          <button
            key={lang.id}
            type="button"
            onClick={() => setSelectedLanguage(lang.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all border cursor-pointer ${
              selectedLanguage === lang.id
                ? "bg-blue-600/30 border-blue-500 text-blue-300 shadow-sm"
                : "bg-[#252526] border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/20"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-[#252526] p-1.5 rounded-xl border border-white/10 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "catalog"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Language Architecture Templates</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "custom"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Code2 className="h-4 w-4" />
          <span>Custom JSON Blueprint</span>
        </button>
      </div>

      {activeTab === "catalog" && (
        <div className="w-full max-w-5xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => {
              const isSelected = template.id === selectedId;
              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedId(template.id)}
                  className={`group relative p-5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#252526] border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500"
                      : "bg-[#1f1f1f] border-white/10 hover:border-white/20 hover:bg-[#252526]/60"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 font-bold text-sm text-white">
                        <FolderTree className={`h-4 w-4 ${isSelected ? "text-blue-400" : "text-slate-400"}`} />
                        <span>{template.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleDownloadTemplateScript(template, e)}
                          className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                          title="Download Bash setup script with full source code algorithms"
                        >
                          <Download className="h-3 w-3" />
                          <span>.sh</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(template.id);
                            onLaunch(template.id);
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Launch</span>
                        </button>
                        {isSelected ? (
                          <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-slate-600 group-hover:border-slate-400 shrink-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {template.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">Language: <strong className="text-blue-400 capitalize">{template.language}</strong></span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="h-3 w-3" /> Rule Engine Verified
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {ruleResults.length > 0 && (
            <div className="bg-[#252526] border border-blue-500/30 rounded-xl p-4 text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Rules Engine Audit: {ruleResults.filter((r) => r.passed).length} / {ruleResults.length} Policy Checks Verified</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {ruleResults.map((res) => (
                  <div key={res.ruleId} className="flex items-center gap-2 bg-[#1e1e1e] p-2 rounded border border-white/5">
                    <span className={res.passed ? "text-emerald-400 font-bold" : "text-rose-400"}>
                      {res.passed ? "✓ PASS" : "✕ FAIL"}
                    </span>
                    <span className="text-slate-300 truncate">{res.ruleName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleLaunchCatalog}
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 border border-blue-400/30 cursor-pointer"
            >
              <Rocket className="h-4 w-4" />
              <span>Launch "{selectedTemplate?.name}" Structure</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => handleDownloadTemplateScript(selectedTemplate, e)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-emerald-600/30 transition-all border border-emerald-400/30 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download .sh Setup Script</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === "custom" && (
        <div className="w-full max-w-3xl space-y-4">
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">Custom Tree JSON Definition</span>
              <span className="text-slate-500">TreeItem[] schema format</span>
            </div>
            <textarea
              rows={12}
              value={customJson}
              onChange={(e) => setCustomJson(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 text-slate-200 font-mono text-xs p-3 rounded-lg outline-none focus:border-blue-500 resize-none leading-relaxed"
            />
            {jsonError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs font-mono">
                {jsonError}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center pt-2">
            <button
              type="button"
              onClick={handleLaunchCustom}
              className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 border border-emerald-400/30 cursor-pointer"
            >
              <Rocket className="h-4 w-4" />
              <span>Launch Custom Blueprint Structure</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
