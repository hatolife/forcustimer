// ! Service Worker - PWAのオフライン対応とキャッシュ管理。

const CACHE_NAME = 'focus-timer-v11';
const urlsToCache = [
	'/',
	'/index.html',
	'/styles.css',
	'/app.js',
	'/timer.js',
	'/manifest.json',
	'/icons/icon-72x72.png',
	'/icons/icon-96x96.png',
	'/icons/icon-128x128.png',
	'/icons/icon-144x144.png',
	'/icons/icon-152x152.png',
	'/icons/icon-192x192.png',
	'/icons/icon-384x384.png',
	'/icons/icon-512x512.png'
];

// ! Service Workerのインストール時。
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log('Opened cache');
			return cache.addAll(urlsToCache);
		})
	);
});

// ! Service Workerのアクティベート時。
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						console.log('Deleting old cache:', cacheName);
						return caches.delete(cacheName);
					}
					return Promise.resolve();
				})
			);
		})
	);
});

// ! ネットワークリクエストの処理。
self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			// ! キャッシュがあればそれを返す。
			if (response) {
				return response;
			}

			// ! なければネットワークからフェッチ。
			return fetch(event.request).then((response) => {
				// ! 有効なレスポンスでない場合はそのまま返す。
				if (!response || response.status !== 200 || response.type !== 'basic') {
					return response;
				}

				// ! レスポンスをクローンしてキャッシュに保存。
				const responseToCache = response.clone();
				caches.open(CACHE_NAME).then((cache) => {
					cache.put(event.request, responseToCache);
				});

				return response;
			});
		})
	);
});

// ! メッセージハンドラー（通知表示用・iOS PWA対応）。
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
		const { title, body, icon, badge } = event.data.payload;

		// ! Service Worker経由で通知を表示（iOS PWAで動作）。
		self.registration.showNotification(title, {
			body: body,
			icon: icon,
			badge: badge
		});
	}
});
