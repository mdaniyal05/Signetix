class UpdateSettingsDto {
  constructor(
    userId,
    theme,
    autoDownload,
    notificationEnabled,
    pslTranslationLanguage
  ) {
    this.userId = userId;
    this.theme = theme;
    this.autoDownload = autoDownload;
    this.notificationEnabled = notificationEnabled;
    this.pslTranslationLanguage = pslTranslationLanguage;
  }
}

module.exports = UpdateSettingsDto;
