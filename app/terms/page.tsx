import { CheckCircle2, Database, FileUp, Search, Trash2, Upload } from "lucide-react";
import { terms } from "@/lib/mock-data";
import { PanelHeader } from "@/components/shared/PanelHeader";

export default function TermsPage() {
  return (
    <main className="app-shell">
      <section className="page-grid panel terms-page">
        <PanelHeader
          title="专业术语库管理页"
          subtitle="会前语料维护、检索、导入和状态管理"
          action={<span className="status-pill">当前状态：已启用</span>}
        />

        <div className="mini-metrics terms-metrics">
          <div className="metric-card">
            <div className="label">术语总数</div>
            <div className="value">256</div>
            <div className="hint">行业通用语料库构建</div>
          </div>
          <div className="metric-card">
            <div className="label">当前状态</div>
            <div className="value">已启用</div>
            <div className="hint">Embedding 与 RAG 已加载</div>
          </div>
          <div className="metric-card">
            <div className="label">最后导入</div>
            <div className="value">2024-05-20</div>
            <div className="hint">支持 CSV / Excel / U 盘导入</div>
          </div>
        </div>

        <div className="toolbar terms-toolbar">
          <button className="primary-button" type="button">
            <Upload size={18} /> 导入 CSV
          </button>
          <button className="secondary-button" type="button">
            <FileUp size={18} /> 导入 Excel
          </button>
          <button className="secondary-button" type="button">
            <Database size={18} /> 从 U 盘导入
          </button>
          <label className="search-wrapper">
            <Search size={18} />
            <input className="search-field" placeholder="搜索中文术语 / 英文术语 / 编号" />
          </label>
          <select className="select-field term-filter" defaultValue="all">
            <option value="all">分类：全部</option>
            <option value="tech">技术类</option>
          </select>
          <select className="select-field term-filter" defaultValue="all-status">
            <option value="all-status">状态：全部</option>
            <option value="enabled">已启用</option>
            <option value="disabled">已禁用</option>
          </select>
          <button className="danger-button" type="button">
            <Trash2 size={18} /> 批量删除
          </button>
        </div>

        <div className="panel-soft table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>中文术语</th>
                <th>英文术语</th>
                <th>编号</th>
                <th>分类</th>
                <th>状态</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {terms.map((term) => (
                <tr key={term.id}>
                  <td>{term.sourceTerm}</td>
                  <td>{term.targetTerm}</td>
                  <td>{term.code ?? "-"}</td>
                  <td>{term.category}</td>
                  <td>
                    <span className={`tag ${term.status === "enabled" ? "green" : "gray"}`}>
                      {term.status === "enabled" ? (
                        <>
                          <CheckCircle2 size={14} /> 已启用
                        </>
                      ) : (
                        "已禁用"
                      )}
                    </span>
                  </td>
                  <td>{term.updatedAt}</td>
                  <td>
                    <button className="secondary-button table-action" type="button">
                      编辑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>共 256 条</span>
          <div className="pages">
            <button className="page active" type="button">
              1
            </button>
            <button className="page" type="button">
              2
            </button>
            <button className="page" type="button">
              3
            </button>
            <button className="page" type="button">
              4
            </button>
            <button className="page" type="button">
              5
            </button>
          </div>
          <span>10 条 / 页</span>
        </div>
      </section>
    </main>
  );
}
