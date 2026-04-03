import './index.css'
import { GenerateSection } from './components/GenerateSection'
import { PreferenceSection } from './components/PreferenceSection'
import { PreviewPane } from './components/PreviewPane'
import { SourceSection } from './components/SourceSection'
import { TemplateBridgePanel } from './components/TemplateBridgePanel'
import { useWorkbenchController } from './hooks/use-workbench-controller'
import brandLogo from '../data/img/logo.png'

export default function App() {
  const {
    audience,
    audienceCatalog,
    canPrimaryAction,
    copiedReady,
    copyReady,
    department,
    departmentCatalog,
    documentData,
    errorMessage,
    exportReady,
    fullscreenReady,
    generationMode,
    generationModeCatalog,
    generationProgress,
    handleCopyLink,
    handleExport,
    handleFullscreen,
    handleGenerateAction,
    handleTemplateSelect,
    iframeKey,
    inputMode,
    isGenerating,
    isReportReady,
    manualText,
    onAudienceChange,
    onDepartmentChange,
    onFileRemove,
    onFileSelect,
    onGenerationModeChange,
    onInputModeChange,
    onManualTextChange,
    onSensitiveModeChange,
    onStyleChange,
    previewDevice,
    previewHtml,
    previewStageRef,
    previewState,
    recentReports,
    selectedFile,
    selectedTemplate,
    sensitiveMode,
    setPreviewDevice,
    showSuccessToast,
    showTemplateBridge,
    styleCatalog,
    stylePreference,
    templateBridgeListRef,
    templateOptionCatalog,
    warnings,
  } = useWorkbenchController()

  return (
    <div className={`app-shell ${isGenerating ? 'is-generating' : ''}`}>
      <header className="app-topbar">
        <div className="brand-lockup">
          <img alt="Docs2Brief Logo" className="brand-logo" src={brandLogo} />
          <div>
            <div className="brand-title font-headline">Docs2Brief</div>
            <div className="brand-subtitle">document to weekly brief</div>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            className="icon-button topbar-monitor-button"
            onClick={() => window.open('/ops/usage', '_blank', 'noopener,noreferrer')}
            type="button"
          >
            <span aria-hidden="true">▦</span>
            <span>API监控</span>
          </button>
          <button
            aria-label="帮助提示"
            className="icon-button topbar-help-icon"
            title="如遇问题相关问题请联系孙铭浩"
            type="button"
          >
            <span aria-hidden="true">ⓘ</span>
          </button>
        </div>
      </header>

      <main className={`workspace ${showTemplateBridge ? 'workspace--with-template-bridge' : ''}`}>
        <aside className="control-panel control-panel--refined">
          <PreferenceSection
            audience={audience}
            audiences={audienceCatalog}
            department={department}
            departments={departmentCatalog}
            generationMode={generationMode}
            generationModes={generationModeCatalog}
            onAudienceChange={onAudienceChange}
            onDepartmentChange={onDepartmentChange}
            onGenerationModeChange={onGenerationModeChange}
            onSensitiveModeChange={onSensitiveModeChange}
            onStyleChange={onStyleChange}
            sensitiveMode={sensitiveMode}
            stylePreference={stylePreference}
            styles={styleCatalog}
          />

          <SourceSection
            inputMode={inputMode}
            manualText={manualText}
            onFileRemove={onFileRemove}
            onFileSelect={onFileSelect}
            onInputModeChange={onInputModeChange}
            onManualTextChange={onManualTextChange}
            selectedFile={selectedFile}
          />

          <GenerateSection
            disabled={!canPrimaryAction}
            generationMode={generationMode}
            isGenerating={isGenerating}
            isReportReady={isReportReady}
            onGenerateAction={handleGenerateAction}
          />

          <div aria-label="反馈与支持" className="support-contact-note" role="note">
            <p className="support-contact-note__title font-headline">反馈与支持</p>
            <p className="support-contact-note__text">
              如遇使用问题或有新增需求，请联系 <strong>孙铭浩</strong>，我们会尽快跟进处理。
            </p>
          </div>

          {errorMessage ? <div className="status-banner status-banner--error">{errorMessage}</div> : null}
          {warnings.length > 0 ? (
            <div className="status-banner status-banner--warning">
              {warnings.map((warning) => (
                <div key={warning}>{warning}</div>
              ))}
            </div>
          ) : null}
        </aside>

        {showTemplateBridge ? (
          <TemplateBridgePanel
            bridgeListRef={templateBridgeListRef}
            onSelectTemplate={handleTemplateSelect}
            selectedTemplateId={selectedTemplate?.id ?? null}
            templates={templateOptionCatalog}
          />
        ) : null}

        <section className="preview-column">
          <PreviewPane
            copiedReady={copiedReady}
            copyReady={copyReady}
            exportReady={exportReady}
            fullscreenReady={fullscreenReady}
            generationMode={generationMode}
            iframeHtml={previewHtml}
            iframeKey={iframeKey}
            onCopyLink={handleCopyLink}
            onDeviceChange={setPreviewDevice}
            onExport={handleExport}
            onFullscreen={handleFullscreen}
            previewDevice={previewDevice}
            previewStageRef={previewStageRef}
            previewState={previewState}
            previewTitle={documentData.title}
            progress={generationProgress}
            recentReports={recentReports}
            selectedTemplate={selectedTemplate}
            showSuccessToast={showSuccessToast}
            templates={templateOptionCatalog}
          />
        </section>
      </main>
    </div>
  )
}
