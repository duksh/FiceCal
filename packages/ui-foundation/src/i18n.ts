import type { Locale } from "./types.js";

// ─── Translation dictionary ───────────────────────────────────────────────────

type TranslationMap = Record<string, string>;
type Catalog = Record<Locale, TranslationMap>;

/**
 * FiceCal v2 localization catalog.
 *
 * Keys use dot-notation namespaces:
 *   ui.*         — generic UI chrome
 *   intent.*     — intent labels and descriptions
 *   scope.*      — scope labels and descriptions
 *   mode.*       — mode labels
 *   health.*     — health score surface strings
 *   budget.*     — budget/forecasting surface strings
 *   common.*     — shared utility strings
 */
const CATALOG: Catalog = {
  en: {
    // UI chrome
    "ui.title":                 "FiceCal",
    "ui.tagline":               "FinOps Decision Support",
    "ui.settings":              "Settings",
    "ui.back":                  "Back",
    "ui.loading":               "Loading…",
    "ui.error":                 "Something went wrong",
    "ui.theme.light":           "Light",
    "ui.theme.dark":            "Dark",
    "ui.theme.system":          "System",
    "ui.language":              "Language",
    "ui.currency":              "Currency",
    "ui.period":                "Period",

    // Intent
    "intent.viability":         "Viability",
    "intent.operations":        "Operations",
    "intent.architecture":      "Architecture",
    "intent.executive":         "Executive",
    "intent.viability.desc":    "Cost justification, break-even, and financial risk",
    "intent.operations.desc":   "Budget adherence, health signals, and spend trends",
    "intent.architecture.desc": "Tradeoff comparison and hosting choice analysis",
    "intent.executive.desc":    "KPI summary and prioritization for leadership",

    // Scope
    "scope.baseline-unit-economics":    "Baseline Economics",
    "scope.optimization-opportunities": "Optimization",
    "scope.architecture-tradeoffs":     "Architecture Tradeoffs",
    "scope.executive-strategy":         "Executive Strategy",

    // Mode
    "mode.quick":     "Quick",
    "mode.operator":  "Operator",
    "mode.architect": "Architect",

    // Health
    "health.score":    "Health Score",
    "health.grade":    "Grade",
    "health.signals":  "Signals",
    "health.ok":       "Healthy",
    "health.warning":  "Warning",
    "health.critical": "Critical",

    // Budget
    "budget.variance":    "Budget Variance",
    "budget.over":        "Over budget",
    "budget.under":       "Under budget",
    "budget.on":          "On budget",
    "budget.forecast":    "Forecast",
    "budget.projection":  "Projection",

    // Common
    "common.currency.usd": "US Dollar",
    "common.currency.eur": "Euro",
    "common.currency.gbp": "British Pound",
    "common.currency.mur": "Mauritian Rupee",
    "common.period.monthly":   "Monthly",
    "common.period.quarterly": "Quarterly",
    "common.period.annual":    "Annual",
  },

  fr: {
    "ui.title":                 "FiceCal",
    "ui.tagline":               "Support Décisionnel FinOps",
    "ui.settings":              "Paramètres",
    "ui.back":                  "Retour",
    "ui.loading":               "Chargement…",
    "ui.error":                 "Une erreur est survenue",
    "ui.theme.light":           "Clair",
    "ui.theme.dark":            "Sombre",
    "ui.theme.system":          "Système",
    "ui.language":              "Langue",
    "ui.currency":              "Devise",
    "ui.period":                "Période",

    "intent.viability":         "Viabilité",
    "intent.operations":        "Opérations",
    "intent.architecture":      "Architecture",
    "intent.executive":         "Exécutif",
    "intent.viability.desc":    "Justification des coûts, seuil de rentabilité et risque financier",
    "intent.operations.desc":   "Respect du budget, signaux de santé et tendances de dépenses",
    "intent.architecture.desc": "Comparaison des compromis et analyse des choix d'hébergement",
    "intent.executive.desc":    "Résumé des KPI et priorisation pour la direction",

    "scope.baseline-unit-economics":    "Économies de Base",
    "scope.optimization-opportunities": "Optimisation",
    "scope.architecture-tradeoffs":     "Compromis Architecturaux",
    "scope.executive-strategy":         "Stratégie Exécutive",

    "mode.quick":     "Rapide",
    "mode.operator":  "Opérateur",
    "mode.architect": "Architecte",

    "health.score":    "Score de Santé",
    "health.grade":    "Note",
    "health.signals":  "Signaux",
    "health.ok":       "Sain",
    "health.warning":  "Avertissement",
    "health.critical": "Critique",

    "budget.variance":   "Écart Budgétaire",
    "budget.over":       "Dépassement budgétaire",
    "budget.under":      "Sous le budget",
    "budget.on":         "Dans le budget",
    "budget.forecast":   "Prévision",
    "budget.projection": "Projection",

    "common.currency.usd": "Dollar américain",
    "common.currency.eur": "Euro",
    "common.currency.gbp": "Livre sterling",
    "common.currency.mur": "Roupie mauricienne",
    "common.period.monthly":   "Mensuel",
    "common.period.quarterly": "Trimestriel",
    "common.period.annual":    "Annuel",
  },

  zh: {
    "ui.title":                 "FiceCal",
    "ui.tagline":               "FinOps 决策支持",
    "ui.settings":              "设置",
    "ui.back":                  "返回",
    "ui.loading":               "加载中…",
    "ui.error":                 "出现错误",
    "ui.theme.light":           "浅色",
    "ui.theme.dark":            "深色",
    "ui.theme.system":          "跟随系统",
    "ui.language":              "语言",
    "ui.currency":              "货币",
    "ui.period":                "周期",

    "intent.viability":         "可行性",
    "intent.operations":        "运营",
    "intent.architecture":      "架构",
    "intent.executive":         "高管",
    "intent.viability.desc":    "成本合理性、盈亏平衡点和财务风险",
    "intent.operations.desc":   "预算执行、健康信号和支出趋势",
    "intent.architecture.desc": "权衡比较和托管方案分析",
    "intent.executive.desc":    "KPI摘要和领导层优先级排序",

    "scope.baseline-unit-economics":    "基础经济学",
    "scope.optimization-opportunities": "优化机会",
    "scope.architecture-tradeoffs":     "架构权衡",
    "scope.executive-strategy":         "高管战略",

    "mode.quick":     "快速",
    "mode.operator":  "运营商",
    "mode.architect": "架构师",

    "health.score":    "健康评分",
    "health.grade":    "等级",
    "health.signals":  "信号",
    "health.ok":       "健康",
    "health.warning":  "警告",
    "health.critical": "严重",

    "budget.variance":   "预算差异",
    "budget.over":       "超出预算",
    "budget.under":      "低于预算",
    "budget.on":         "符合预算",
    "budget.forecast":   "预测",
    "budget.projection": "预计",

    "common.currency.usd": "美元",
    "common.currency.eur": "欧元",
    "common.currency.gbp": "英镑",
    "common.currency.mur": "毛里求斯卢比",
    "common.period.monthly":   "每月",
    "common.period.quarterly": "每季度",
    "common.period.annual":    "每年",
  },
};

// ─── LocalizationShell ────────────────────────────────────────────────────────

/**
 * Lightweight localization shell for FiceCal v2.
 *
 * Design goals:
 * - No build step required (no Babel, no ICU, no complex bundler plugins)
 * - Safe fallback: returns the key itself if translation is missing
 * - Supports simple `{{variable}}` interpolation
 * - Locale can be changed at runtime; subscribers are notified
 */
export class LocalizationShell {
  private locale: Locale;
  private readonly listeners = new Set<(locale: Locale) => void>();

  constructor(locale: Locale = "en") {
    this.locale = locale;
  }

  // ─── API ─────────────────────────────────────────────────────────────────

  getLocale(): Locale { return this.locale; }

  setLocale(locale: Locale): void {
    this.locale = locale;
    this.listeners.forEach((l) => l(locale));
  }

  /**
   * Translate a key. Returns the key itself if no translation exists.
   * Supports `{{variableName}}` interpolation via the vars map.
   *
   * Example: t("ui.loading") → "Loading…"
   * Example: t("greeting", { name: "Alice" }) with "Hello, {{name}}!" → "Hello, Alice!"
   */
  t(key: string, vars?: Record<string, string>): string {
    const dict = CATALOG[this.locale];
    let text = dict[key] ?? CATALOG["en"][key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replaceAll(`{{${k}}}`, v);
      }
    }
    return text;
  }

  /**
   * Returns true when the key has a translation in the current locale.
   */
  has(key: string): boolean {
    return key in CATALOG[this.locale] || key in CATALOG["en"];
  }

  /**
   * Returns all keys defined across all locales (union).
   */
  allKeys(): string[] {
    const keys = new Set<string>();
    for (const dict of Object.values(CATALOG)) {
      Object.keys(dict).forEach((k) => keys.add(k));
    }
    return [...keys].sort();
  }

  subscribe(listener: (locale: Locale) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
