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
  "badge.family": {
    en: "Family", es: "Familiar", fr: "Famille", de: "Familie", ja: "ファミリー",
  },
  "badge.senior": {
    en: "Senior-friendly", es: "Para mayores", fr: "Adapté aux aînés",
    de: "Seniorenfreundlich", ja: "シニア向け",
  },
  "badge.visited": {
    en: "visited {n}×", es: "visitado {n}×", fr: "visité {n}×",
    de: "{n}× besucht", ja: "{n}回訪問",
  },
  "badge.paid": {
    en: "Paid", es: "De pago", fr: "Payant", de: "Kostenpflichtig", ja: "有料",
  },
  "badge.noInfo": {
    en: "No info", es: "Sin info", fr: "Aucune info", de: "Keine Infos", ja: "情報なし",
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

  // ---- Persona picker (first-touch) ----
  "persona.welcome": {
    en: "Welcome to {brand}", es: "Bienvenido a {brand}", fr: "Bienvenue sur {brand}",
    de: "Willkommen bei {brand}", ja: "{brand}へようこそ",
  },
  "persona.sub": {
    en: "Help us tailor it. Pick one — you can change later.",
    es: "Ayúdanos a adaptarla. Elige una — puedes cambiarla luego.",
    fr: "Aidez-nous à l'adapter. Choisissez — modifiable plus tard.",
    de: "Hilf uns, die App anzupassen. Wähle eins — später änderbar.",
    ja: "あなたに合わせます。あとで変更できます。",
  },
  "persona.student.name": {
    en: "I'm a student", es: "Soy estudiante", fr: "Je suis étudiant·e",
    de: "Ich bin Student:in", ja: "学生です",
  },
  "persona.student.desc": {
    en: "Show free options first. Quick share with friends. No purchase required filter on by default.",
    es: "Opciones gratis primero. Compartir rápido. Filtro «sin compra» activado.",
    fr: "Options gratuites d'abord. Partage rapide. Filtre « gratuit » activé.",
    de: "Kostenlose Optionen zuerst. Schnelles Teilen. Gratis-Filter aktiv.",
    ja: "無料の選択肢を優先。簡単共有。無料フィルターをオンに。",
  },
  "persona.senior.name": {
    en: "Larger text + accessibility", es: "Texto grande + accesibilidad",
    fr: "Texte agrandi + accessibilité", de: "Größere Schrift + Barrierefreiheit",
    ja: "大きな文字とアクセシビリティ",
  },
  "persona.senior.desc": {
    en: "Bigger buttons, calmer screen, accessibility filter on, walking time at a relaxed pace. Less visual noise.",
    es: "Botones grandes, pantalla tranquila, filtro accesible, ritmo de paseo relajado.",
    fr: "Grands boutons, écran apaisé, filtre accessible, rythme de marche détendu.",
    de: "Große Buttons, ruhiger Bildschirm, Barrierefrei-Filter, gemütliches Tempo.",
    ja: "大きなボタン、落ち着いた画面、ゆっくり歩行の所要時間。",
  },
  "persona.default.name": {
    en: "Just give me the app", es: "Solo dame la app", fr: "Donnez-moi juste l'appli",
    de: "Einfach die App", ja: "そのまま使う",
  },
  "persona.default.desc": {
    en: "Default experience. All features on.", es: "Experiencia estándar. Todo activado.",
    fr: "Expérience par défaut. Tout activé.", de: "Standard. Alles an.", ja: "標準設定。全機能オン。",
  },
  "persona.skip": {
    en: "skip", es: "omitir", fr: "passer", de: "überspringen", ja: "スキップ",
  },

  // ---- Roulette ----
  "roulette.spinning": {
    en: "Picking…", es: "Eligiendo…", fr: "Choix…", de: "Wird gewählt…", ja: "選んでいます…",
  },
  "roulette.label": {
    en: "Try somewhere new", es: "Prueba otro sitio", fr: "Tentez un autre endroit",
    de: "Was Neues probieren", ja: "新しい場所を試す",
  },

  // ---- Reviews ----
  "reviews.title": {
    en: "Reviews", es: "Reseñas", fr: "Avis", de: "Bewertungen", ja: "レビュー",
  },
  "reviews.one": {
    en: "{n} review", es: "{n} reseña", fr: "{n} avis", de: "{n} Bewertung", ja: "{n}件",
  },
  "reviews.many": {
    en: "{n} reviews", es: "{n} reseñas", fr: "{n} avis", de: "{n} Bewertungen", ja: "{n}件",
  },
  "reviews.write": {
    en: "+ Write a review", es: "+ Escribir reseña", fr: "+ Écrire un avis",
    de: "+ Bewertung schreiben", ja: "+ レビューを書く",
  },
  "reviews.overall": {
    en: "Overall", es: "General", fr: "Général", de: "Gesamt", ja: "総合",
  },
  "reviews.placeholder": {
    en: "Anything useful for the next person? (optional)",
    es: "¿Algo útil para la siguiente persona? (opcional)",
    fr: "Un détail utile pour la personne suivante ? (facultatif)",
    de: "Etwas Nützliches für die Nächsten? (optional)",
    ja: "次の人に役立つ情報があれば（任意）",
  },
  "reviews.post": {
    en: "Post", es: "Publicar", fr: "Publier", de: "Posten", ja: "投稿",
  },
  "reviews.empty": {
    en: "No reviews yet — be the first.",
    es: "Aún no hay reseñas — sé la primera persona.",
    fr: "Pas encore d'avis — soyez le premier.",
    de: "Noch keine Bewertungen — sei die erste.",
    ja: "まだレビューがありません — 最初の一人に。",
  },

  // ---- Recently added ----
  "recent.title": {
    en: "Recently added by you", es: "Añadidos por ti", fr: "Ajoutés par vous",
    de: "Von dir hinzugefügt", ja: "あなたが追加した場所",
  },
  "recent.contributed": {
    en: "{n} contributed", es: "{n} aportados", fr: "{n} contributions",
    de: "{n} beigetragen", ja: "{n}件の投稿",
  },
  "recent.badge": {
    en: "added by you", es: "añadido por ti", fr: "ajouté par vous",
    de: "von dir", ja: "あなたの投稿",
  },

  // ---- Report-type labels (display only — stored keys stay English) ----
  "report.clean": {
    en: "Clean", es: "Limpio", fr: "Propre", de: "Sauber", ja: "清潔",
  },
  "report.dirty": {
    en: "Dirty", es: "Sucio", fr: "Sale", de: "Schmutzig", ja: "汚れている",
  },
  "report.needs_supplies": {
    en: "Needs supplies", es: "Faltan suministros", fr: "Manque de fournitures",
    de: "Nachschub nötig", ja: "備品切れ",
  },
  "report.out_of_order": {
    en: "Out of order", es: "Fuera de servicio", fr: "Hors service",
    de: "Außer Betrieb", ja: "故障中",
  },
  "report.not_here": {
    en: "Doesn't exist", es: "No existe", fr: "N'existe pas",
    de: "Existiert nicht", ja: "存在しない",
  },

  // ---- Facilities / fixtures ----
  "fixture.stalls": {
    en: "Stalls", es: "Cabinas", fr: "Cabines", de: "Kabinen", ja: "個室",
  },
  "fixture.sink": {
    en: "Sink", es: "Lavabo", fr: "Lavabo", de: "Waschbecken", ja: "洗面台",
  },
  "fixture.paper_towels": {
    en: "Paper towels", es: "Toallas de papel", fr: "Essuie-mains",
    de: "Papierhandtücher", ja: "ペーパータオル",
  },
  "fixture.changing_table": {
    en: "Changing table", es: "Cambiador", fr: "Table à langer",
    de: "Wickeltisch", ja: "おむつ交換台",
  },
  "facilities.none": {
    en: "No facility details yet — know this bathroom?",
    es: "Sin detalles aún — ¿conoces este baño?",
    fr: "Pas encore de détails — vous connaissez ces toilettes ?",
    de: "Noch keine Details — kennst du dieses WC?",
    ja: "設備情報はまだありません — この場所を知っていますか？",
  },
  "facilities.edit": {
    en: "Edit facilities", es: "Editar instalaciones", fr: "Modifier les équipements",
    de: "Ausstattung bearbeiten", ja: "設備を編集",
  },
  "facilities.add": {
    en: "Add facilities", es: "Añadir instalaciones", fr: "Ajouter des équipements",
    de: "Ausstattung hinzufügen", ja: "設備を追加",
  },
  "facilities.yourEdits": {
    en: "your edits", es: "tus datos", fr: "vos données", de: "deine Angaben", ja: "あなたの編集",
  },
  "facilities.dontKnow": {
    en: "Don't know", es: "No sé", fr: "Je ne sais pas", de: "Weiß nicht", ja: "不明",
  },

  // ---- Common ----
  "common.yes": { en: "Yes", es: "Sí", fr: "Oui", de: "Ja", ja: "はい" },
  "common.no": { en: "No", es: "No", fr: "Non", de: "Nein", ja: "いいえ" },
  "common.save": { en: "Save", es: "Guardar", fr: "Enregistrer", de: "Speichern", ja: "保存" },
  "common.cancel": { en: "Cancel", es: "Cancelar", fr: "Annuler", de: "Abbrechen", ja: "キャンセル" },

  // ---- Add-a-bathroom form ----
  "add.usingLocation": {
    en: "Using your current location", es: "Usando tu ubicación actual",
    fr: "Position actuelle utilisée", de: "Aktueller Standort", ja: "現在地を使用中",
  },
  "add.nearestPlace": {
    en: "Nearest place:", es: "Lugar más cercano:", fr: "Lieu le plus proche :",
    de: "Nächster Ort:", ja: "最寄りの場所：",
  },
  "add.use": {
    en: "use →", es: "usar →", fr: "utiliser →", de: "übernehmen →", ja: "使う →",
  },
  "add.nameLabel": {
    en: "What's it called?", es: "¿Cómo se llama?", fr: "Comment ça s'appelle ?",
    de: "Wie heißt es?", ja: "名前は？",
  },
  "add.namePlaceholder": {
    en: "e.g. Starbucks on 5th, library 2nd floor",
    es: "p. ej. Starbucks de la 5ª, biblioteca 2.º piso",
    fr: "ex. Starbucks de la 5e, bibliothèque 2e étage",
    de: "z. B. Starbucks 5th, Bibliothek 2. OG",
    ja: "例：5番街のスタバ、図書館2階",
  },
  "add.tags": {
    en: "Tags", es: "Etiquetas", fr: "Tags", de: "Merkmale", ja: "タグ",
  },
  "add.notesLabel": {
    en: "Notes (optional)", es: "Notas (opcional)", fr: "Notes (facultatif)",
    de: "Hinweise (optional)", ja: "メモ（任意）",
  },
  "add.notesPlaceholder": {
    en: "Code on the door? Always clean? Anything useful for the next person.",
    es: "¿Código en la puerta? ¿Siempre limpio? Lo que sea útil para la siguiente persona.",
    fr: "Code sur la porte ? Toujours propre ? Tout ce qui est utile.",
    de: "Türcode? Immer sauber? Alles Nützliche für die Nächsten.",
    ja: "ドアの暗証番号は？いつも清潔？役立つ情報を。",
  },
  "add.shareTitle": {
    en: "Share with everyone", es: "Compartir con todos", fr: "Partager avec tous",
    de: "Mit allen teilen", ja: "みんなと共有",
  },
  "add.shareBody": {
    en: "— also send this to Refuge Restrooms so the world's open data improves. Their moderators review before publishing.",
    es: "— también se envía a Refuge Restrooms para mejorar los datos abiertos. Sus moderadores lo revisan antes de publicar.",
    fr: "— envoyé aussi à Refuge Restrooms pour améliorer les données ouvertes. Leurs modérateurs valident avant publication.",
    de: "— geht auch an Refuge Restrooms für bessere offene Daten. Deren Moderation prüft vor Veröffentlichung.",
    ja: "— Refuge Restroomsにも送信され、オープンデータの改善に役立ちます。公開前にモデレーターが確認します。",
  },
  "add.saveShare": {
    en: "Save + share", es: "Guardar y compartir", fr: "Enregistrer + partager",
    de: "Speichern + teilen", ja: "保存して共有",
  },
  "add.saveLocal": {
    en: "Save to my map", es: "Guardar en mi mapa", fr: "Enregistrer sur ma carte",
    de: "Auf meiner Karte speichern", ja: "自分の地図に保存",
  },
  "add.savedTitle": {
    en: "✓ Saved", es: "✓ Guardado", fr: "✓ Enregistré", de: "✓ Gespeichert", ja: "✓ 保存しました",
  },
  "add.savedBody": {
    en: "“{name}” is now in your list, sorted by distance.",
    es: "«{name}» ya está en tu lista, ordenada por distancia.",
    fr: "« {name} » est dans votre liste, triée par distance.",
    de: "„{name}“ ist jetzt in deiner Liste, nach Entfernung sortiert.",
    ja: "「{name}」がリストに追加されました（距離順）。",
  },
  "add.upstreamPending": {
    en: "Sharing with Refuge Restrooms…", es: "Compartiendo con Refuge Restrooms…",
    fr: "Partage avec Refuge Restrooms…", de: "Teile mit Refuge Restrooms…",
    ja: "Refuge Restroomsと共有中…",
  },
  "add.upstreamOk": {
    en: "✓ Shared with Refuge Restrooms — pending their review. The world thanks you.",
    es: "✓ Compartido con Refuge Restrooms — pendiente de revisión. El mundo te lo agradece.",
    fr: "✓ Partagé avec Refuge Restrooms — en attente de validation. Le monde vous remercie.",
    de: "✓ Mit Refuge Restrooms geteilt — Prüfung ausstehend. Die Welt dankt dir.",
    ja: "✓ Refuge Restroomsと共有しました — 審査待ちです。",
  },
  "add.upstreamError": {
    en: "Couldn't share upstream right now. Your local copy is fine.",
    es: "No se pudo compartir ahora. Tu copia local está a salvo.",
    fr: "Partage impossible pour l'instant. Votre copie locale est intacte.",
    de: "Teilen gerade nicht möglich. Deine lokale Kopie bleibt.",
    ja: "今は共有できませんでした。ローカル保存は完了しています。",
  },
  "add.submitManually": {
    en: "Submit it manually here.", es: "Envíalo manualmente aquí.",
    fr: "Soumettez-le manuellement ici.", de: "Hier manuell einreichen.",
    ja: "こちらから手動で送信。",
  },
  "add.localOnly": {
    en: "Saved on your device only. Want strangers to find it too?",
    es: "Guardado solo en tu dispositivo. ¿Quieres que otros lo encuentren?",
    fr: "Enregistré sur votre appareil seulement. Pour que d'autres le trouvent :",
    de: "Nur auf deinem Gerät gespeichert. Sollen es andere finden?",
    ja: "この端末のみに保存。他の人にも見つけてほしいなら：",
  },
  "add.shareLink": {
    en: "Share with Refuge Restrooms →", es: "Compartir con Refuge Restrooms →",
    fr: "Partager avec Refuge Restrooms →", de: "Mit Refuge Restrooms teilen →",
    ja: "Refuge Restroomsと共有 →",
  },
  "common.done": {
    en: "Done", es: "Listo", fr: "Terminé", de: "Fertig", ja: "完了",
  },

  // ---- Photos + cleanliness ----
  "photos.empty": {
    en: "No photos yet — be the first.",
    es: "Aún no hay fotos — sube la primera.",
    fr: "Pas encore de photos — soyez le premier.",
    de: "Noch keine Fotos — mach das erste.",
    ja: "まだ写真がありません — 最初の一枚を。",
  },
  "photos.upload": {
    en: "Upload a photo", es: "Subir una foto", fr: "Ajouter une photo",
    de: "Foto hochladen", ja: "写真をアップロード",
  },
  "clean.none": {
    en: "No cleanliness reports yet.",
    es: "Aún no hay informes de limpieza.",
    fr: "Pas encore de signalements de propreté.",
    de: "Noch keine Sauberkeitsmeldungen.",
    ja: "清掃報告はまだありません。",
  },
  "clean.lastPrefix": {
    en: "Last reported clean", es: "Última vez limpio", fr: "Propre pour la dernière fois",
    de: "Zuletzt sauber gemeldet", ja: "最後に清潔と報告：",
  },
  "clean.reportsTotal": {
    en: "{n} reports total", es: "{n} informes en total", fr: "{n} signalements",
    de: "{n} Meldungen gesamt", ja: "計{n}件",
  },
  "clean.reportNow": {
    en: "Report it's clean now", es: "Informar que está limpio",
    fr: "Signaler que c'est propre", de: "Als sauber melden", ja: "今きれいだと報告",
  },

  // ---- Achievements chrome (names stay English — untranslatable puns
  //      are brand voice; a bad translation beats no translation never) ----
  "ach.unlocked": {
    en: "Unlocked:", es: "Desbloqueado:", fr: "Débloqué :", de: "Freigeschaltet:", ja: "解除：",
  },

  // ---- Map legend ----
  "legend.public": {
    en: "Public", es: "Público", fr: "Public", de: "Öffentlich", ja: "公共",
  },
  "legend.addedByYou": {
    en: "Added by you", es: "Añadido por ti", fr: "Ajouté par vous", de: "Von dir", ja: "あなたの投稿",
  },
  "legend.usuals": {
    en: "Your usuals (sized by visits)", es: "Tus habituales (según visitas)",
    fr: "Vos habitués (taille selon visites)", de: "Deine Stammorte (nach Besuchen)",
    ja: "よく行く場所（訪問回数順）",
  },

  // ---- Voice ----
  "voice.label": { en: "Voice", es: "Voz", fr: "Voix", de: "Sprache", ja: "音声" },
  "voice.listening": {
    en: "Listening…", es: "Escuchando…", fr: "Écoute…", de: "Höre zu…", ja: "聞き取り中…",
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
