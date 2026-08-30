/**
 * String table — one key per UI string, all locales inline so gaps are
 * visible at a glance. Missing translations fall back to `en` (see
 * translate() in ./index.js).
 *
 * v1 scope: the main screen, filters, heroes, install nudge, and the
 * details-panel section headings. Data-coupled labels (report types,
 * inferred venue kinds, achievements) stay English for now — they're
 * stored/compared by value and need a careful migration.
 */

export const STRINGS = {
  // ---- Header / global ----
  "app.tagline": {
    en: "closest bathroom, instantly",
    es: "el baño más cercano, al instante",
    fr: "les toilettes les plus proches, instantanément",
    de: "das nächste WC, sofort",
    ja: "最寄りのトイレを、すぐに",
  },

  // ---- Banners ----
  "banner.fallback": {
    en: "Showing San Francisco — enable location for your area",
    es: "Mostrando San Francisco — activa la ubicación para tu zona",
    fr: "San Francisco affiché — activez la localisation pour votre zone",
    de: "Zeige San Francisco — aktiviere den Standort für deine Gegend",
    ja: "サンフランシスコを表示中 — 位置情報を有効にしてください",
  },
  "banner.offline": {
    en: "Offline — showing your last cached bathrooms",
    es: "Sin conexión — mostrando tus baños guardados",
    fr: "Hors ligne — vos dernières toilettes en cache",
    de: "Offline — zeige zuletzt gespeicherte WCs",
    ja: "オフライン — 保存済みのトイレを表示中",
  },
  "banner.searchedPrefix": {
    en: "Showing results near",
    es: "Resultados cerca de",
    fr: "Résultats près de",
    de: "Ergebnisse in der Nähe von",
    ja: "検索地点の周辺を表示中：",
  },
  "banner.backToMe": {
    en: "back to me",
    es: "volver a mí",
    fr: "revenir à moi",
    de: "zurück zu mir",
    ja: "現在地に戻る",
  },

  // ---- Status screens ----
  "status.finding": {
    en: "Finding your location…",
    es: "Buscando tu ubicación…",
    fr: "Recherche de votre position…",
    de: "Standort wird gesucht…",
    ja: "位置情報を取得中…",
  },
  "status.loading": {
    en: "Loading…",
    es: "Cargando…",
    fr: "Chargement…",
    de: "Wird geladen…",
    ja: "読み込み中…",
  },
  "status.loadFail": {
    en: "Couldn't load restrooms",
    es: "No se pudieron cargar los baños",
    fr: "Impossible de charger les toilettes",
    de: "WCs konnten nicht geladen werden",
    ja: "トイレを読み込めませんでした",
  },
  "status.tryAgain": {
    en: "Try again",
    es: "Reintentar",
    fr: "Réessayer",
    de: "Erneut versuchen",
    ja: "再試行",
  },
  "status.none": {
    en: "No restrooms found nearby",
    es: "No se encontraron baños cerca",
    fr: "Aucunes toilettes trouvées à proximité",
    de: "Keine WCs in der Nähe gefunden",
    ja: "近くにトイレが見つかりません",
  },
  "status.refreshHint": {
    en: "Try refreshing your location.",
    es: "Prueba a actualizar tu ubicación.",
    fr: "Essayez d'actualiser votre position.",
    de: "Aktualisiere deinen Standort.",
    ja: "位置情報を更新してみてください。",
  },
  "status.refresh": {
    en: "Refresh",
    es: "Actualizar",
    fr: "Actualiser",
    de: "Aktualisieren",
    ja: "更新",
  },

  // ---- Filter chips ----
  "filter.accessible": {
    en: "Accessible", es: "Accesible", fr: "Accessible", de: "Barrierefrei", ja: "バリアフリー",
  },
  "filter.unisex": {
    en: "Gender Neutral", es: "Unisex", fr: "Mixte", de: "Unisex", ja: "男女共用",
  },
  "filter.free": {
    en: "Free", es: "Gratis", fr: "Gratuit", de: "Kostenlos", ja: "無料",
  },
  "filter.openNow": {
    en: "Open now", es: "Abierto ahora", fr: "Ouvert", de: "Jetzt geöffnet", ja: "営業中",
  },
  "filter.private": {
    en: "Private", es: "Privado", fr: "Privé", de: "Privat", ja: "個室",
  },
  "filter.bench": {
    en: "Bench nearby", es: "Banco cerca", fr: "Banc à proximité", de: "Bank in der Nähe", ja: "近くにベンチ",
  },
  "filter.noStairs": {
    en: "No stairs", es: "Sin escaleras", fr: "Sans escaliers", de: "Ohne Treppen", ja: "階段なし",
  },
  "filter.nearMe": {
    en: "Near me", es: "Cerca de mí", fr: "Près de moi", de: "In meiner Nähe", ja: "現在地へ",
  },
  "filter.allCountries": {
    en: "All countries", es: "Todos los países", fr: "Tous les pays", de: "Alle Länder", ja: "すべての国",
  },

  // ---- Count summary + suppression row ----
  "count.nearby": {
    en: "nearby", es: "cerca", fr: "à proximité", de: "in der Nähe", ja: "件が近くに",
  },
  "count.within": {
    en: "within {d}", es: "a menos de {d}", fr: "à moins de {d}", de: "unter {d}", ja: "{d}以内",
  },
  "suppressed.hidden": {
    en: "{n} hidden as “doesn't exist”",
    es: "{n} ocultos como «no existe»",
    fr: "{n} masqués comme « n'existe pas »",
    de: "{n} als „existiert nicht“ ausgeblendet",
    ja: "「存在しない」として{n}件非表示",
  },
  "suppressed.restore": {
    en: "Restore", es: "Restaurar", fr: "Restaurer", de: "Wiederherstellen", ja: "元に戻す",
  },

  // ---- Heroes ----
  "hero.closest": {
    en: "CLOSEST RESTROOM", es: "BAÑO MÁS CERCANO", fr: "TOILETTES LES PLUS PROCHES",
    de: "NÄCHSTES WC", ja: "一番近いトイレ",
  },
  "hero.nth": {
    en: "#{n} NEAREST", es: "#{n} MÁS CERCANO", fr: "#{n} PLUS PROCHE",
    de: "#{n} NÄCHSTGELEGEN", ja: "#{n}番目に近い",
  },
  "hero.away": {
    en: "away", es: "de distancia", fr: "de distance", de: "entfernt", ja: "の距離",
  },
  "hero.minWalk": {
    en: "min walk", es: "min a pie", fr: "min à pied", de: "Min zu Fuß", ja: "分（徒歩）",
  },
  "hero.details": {
    en: "More details", es: "Más detalles", fr: "Plus de détails", de: "Mehr Details", ja: "詳細を見る",
  },
  "hero.showRoute": {
    en: "Show route", es: "Ver ruta", fr: "Voir l'itinéraire", de: "Route anzeigen", ja: "ルートを表示",
  },
  "simple.minWalk": {
    en: "{n} min walk", es: "{n} min a pie", fr: "{n} min à pied", de: "{n} Min zu Fuß", ja: "徒歩{n}分",
  },
  "simple.goDirection": {
    en: "go {dir}", es: "hacia {dir}", fr: "vers {dir}", de: "Richtung {dir}", ja: "{dir}方向",
  },
  "simple.next": {
    en: "Not it? Show next →", es: "¿No es? Ver siguiente →", fr: "Pas ça ? Suivant →",
    de: "Nicht das? Nächstes →", ja: "違う？次へ →",
  },
  "simple.more": {
    en: "More options", es: "Más opciones", fr: "Plus d'options", de: "Mehr Optionen", ja: "その他のオプション",
  },
  "alts.title": {
    en: "Or pick another nearby", es: "O elige otro cercano", fr: "Ou un autre à proximité",
    de: "Oder ein anderes in der Nähe", ja: "近くの別のトイレ",
  },

  "badge.closed": {
    en: "Closed", es: "Cerrado", fr: "Fermé", de: "Geschlossen", ja: "営業時間外",
  },

  // ---- Main-screen buttons ----
  "map.viewAll": {
    en: "View all {n} on map", es: "Ver los {n} en el mapa", fr: "Voir les {n} sur la carte",
    de: "Alle {n} auf der Karte", ja: "地図で{n}件すべて見る",
  },
  "map.label": {
    en: "Map", es: "Mapa", fr: "Carte", de: "Karte", ja: "地図",
  },
  "add.button": {
    en: "Add a bathroom here", es: "Añadir un baño aquí", fr: "Ajouter des toilettes ici",
    de: "Hier ein WC hinzufügen", ja: "ここにトイレを追加",
  },
  "tip.button": {
    en: "Tip the dev", es: "Invita a un café al dev", fr: "Offrez un café au dev",
    de: "Spendier dem Dev einen Kaffee", ja: "開発者にコーヒーをおごる",
  },

  // ---- Install nudge ----
  "install.title": {
    en: "Faster next time you gotta go",
    es: "La próxima urgencia, más rápido",
    fr: "Plus rapide la prochaine fois",
    de: "Beim nächsten Mal schneller",
    ja: "次はもっと速く",
  },
  "install.body": {
    en: "Install the app — opens instantly, works offline, no store needed.",
    es: "Instala la app: abre al instante y funciona sin conexión.",
    fr: "Installez l'appli : ouverture instantanée, fonctionne hors ligne.",
    de: "App installieren — startet sofort, funktioniert offline.",
    ja: "アプリをインストール — すぐ起動、オフラインでも使えます。",
  },
  "install.iosTap": {
    en: "Tap", es: "Toca", fr: "Touchez", de: "Tippe", ja: "",
  },
  "install.iosThen": {
    en: "then", es: "y luego", fr: "puis", de: "dann", ja: "をタップして",
  },
  "install.iosAction": {
    en: "Add to Home Screen", es: "Añadir a pantalla de inicio", fr: "Sur l'écran d'accueil",
    de: "Zum Home-Bildschirm", ja: "「ホーム画面に追加」",
  },
  "install.iosSuffix": {
    en: "— opens instantly, works offline.",
    es: "— abre al instante, funciona sin conexión.",
    fr: "— ouverture instantanée, hors ligne aussi.",
    de: "— startet sofort, funktioniert offline.",
    ja: "— すぐ起動、オフラインでも使えます。",
  },
  "install.cta": {
    en: "Install", es: "Instalar", fr: "Installer", de: "Installieren", ja: "インストール",
  },

  // ---- Details panel section headings ----
  "panel.hours": {
    en: "Hours", es: "Horario", fr: "Horaires", de: "Öffnungszeiten", ja: "営業時間",
  },
  "panel.directions": {
    en: "Directions", es: "Cómo llegar", fr: "Itinéraire", de: "Wegbeschreibung", ja: "行き方",
  },
  "panel.notes": {
    en: "Notes", es: "Notas", fr: "Notes", de: "Hinweise", ja: "メモ",
  },
  "panel.photos": {
    en: "Photos", es: "Fotos", fr: "Photos", de: "Fotos", ja: "写真",
  },
  "panel.facilities": {
    en: "Facilities", es: "Instalaciones", fr: "Équipements", de: "Ausstattung", ja: "設備",
  },
  "panel.report": {
    en: "Report condition (earn points)",
    es: "Informar del estado (gana puntos)",
    fr: "Signaler l'état (gagnez des points)",
    de: "Zustand melden (Punkte sammeln)",
    ja: "状態を報告（ポイント獲得）",
  },
  "panel.cleanliness": {
    en: "Cleanliness", es: "Limpieza", fr: "Propreté", de: "Sauberkeit", ja: "清潔さ",
  },
  "panel.getDirections": {
    en: "Get Directions →", es: "Cómo llegar →", fr: "Itinéraire →", de: "Route →", ja: "経路案内 →",
  },
  "panel.streetView": {
    en: "See on Street View", es: "Ver en Street View", fr: "Voir sur Street View",
    de: "In Street View ansehen", ja: "ストリートビューで見る",
  },
};
