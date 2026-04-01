export function GenerateSection({ disabled, isGenerating, onGenerate, generationMode }) {
  return (
    <button className="generate-action-button" disabled={disabled} onClick={onGenerate} type="button">
      {isGenerating ? (
        <>
          <span className="button-spinner" />
          <span>AI 分析中...</span>
        </>
      ) : (
        <span>{generationMode === 'llm-html' ? '生成 LLM 报告' : '生成可视化报告'}</span>
      )}
    </button>
  )
}
