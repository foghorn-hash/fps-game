/**
 * Dust & Lead - 3D Wild West FPS WordPress Embed Helper
 */

(function ($) {
  'use strict';

  $(document).ready(function () {
    // Fullscreen Toggle
    $('.dust-and-lead-fs-btn').on('click', function (e) {
      e.preventDefault();
      var targetId = $(this).data('target');
      var elem = document.getElementById(targetId);

      if (!elem) return;

      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }
        $(this).find('span').text('Exit Fullscreen');
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        $(this).find('span').text('Fullscreen');
      }
    });

    // Auto-focus game iframe on click for seamless pointer lock
    $('.dust-and-lead-wrapper').on('click', function () {
      var iframe = $(this).find('iframe')[0];
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.focus();
      }
    });

    // Listen for high-score messages posted from game
    window.addEventListener('message', function (event) {
      if (!event.data || event.data.type !== 'DUST_AND_LEAD_SCORE') return;

      if (typeof dustAndLeadSettings !== 'undefined' && dustAndLeadSettings.apiUrl) {
        $.ajax({
          url: dustAndLeadSettings.apiUrl + 'score',
          method: 'POST',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('X-WP-Nonce', dustAndLeadSettings.nonce);
          },
          contentType: 'application/json',
          data: JSON.stringify({
            score: event.data.score,
            wave: event.data.wave,
            difficulty: event.data.difficulty || 'gunslinger',
            name: event.data.name || 'Marshal',
          }),
          success: function (res) {
            console.log('Dust & Lead score recorded in WordPress:', res);
          },
        });
      }
    });
  });
})(jQuery);
