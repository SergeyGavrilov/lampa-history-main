(function () {
    'use strict';

    if (window.lampa_history_main_ready) return;

    if (!window.Lampa || !Lampa.ContentRows || !Lampa.Favorite) {
        console.warn('[history-main] Эта версия Lampa не поддерживает ряды плагинов.');
        return;
    }

    window.lampa_history_main_ready = true;

    Lampa.ContentRows.add({
        name: 'history_main',
        title: 'История просмотров',
        index: 0,
        screen: ['main'],
        call: function () {
            var history = Lampa.Favorite.get({ type: 'history' });
            if (!history || !history.length) return;

            return function (done) {
                done({
                    title: 'История просмотров',
                    results: history.slice(0, 20)
                });
            };
        }
    });
}());
