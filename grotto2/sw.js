
// ServiceWorker処理：https://developers.google.com/web/fundamentals/primers/service-workers/?hl=ja

// キャッシュ名とキャッシュファイルの指定
var CACHE_NAME = 'pwa-grotto-caches';
var urlsToCache = [
	'/grotto2/',
	'/grotto2/assets/css/reset.css',
	'/grotto2/assets/js/game.js',
	'/grotto2/assets/js/phaser.min.js',
	'/grotto2/assets/data/map.json',
	'/grotto2/assets/img/tiles.png',
	'/grotto2/assets/img/player.png',
	'/grotto2/assets/img/enemies.png',
	'/grotto2/assets/img/items.png',
	'/grotto2/assets/img/meter.png',
	'/grotto2/assets/img/number.png',
	'/grotto2/assets/img/text.png',
	'/grotto2/assets/img/btns.png'
];

// インストール処理
self.addEventListener('install', function(event) {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then(function(cache) {
				return cache.addAll(urlsToCache);
			})
	);
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches
			.match(event.request)
			.then(function(response) {
				return response ? response : fetch(event.request);
			})
	);
});
