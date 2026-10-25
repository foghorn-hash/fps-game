<?php
/**
 * Plugin Name:       Dust & Lead - 3D Wild West FPS
 * Plugin URI:        https://github.com/matti-kiviharju/dust-and-lead-fps
 * Description:       Action-packed 3D First-Person Shooter in the Wild West with realistic Cannon-es physics, Colt Peacemaker revolvers, TNT barrel explosions, and Outlaw AI. Embed with [dust_and_lead_fps] or Gutenberg block.
 * Version:           1.0.0
 * Author:            Matti Kiviharju
 * Author URI:        https://ais-pre-ruptlmt33jwkbwccyp54dl-421769122930.europe-west2.run.app
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       dust-and-lead-fps
 * Domain Path:       /languages
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

define('DUST_AND_LEAD_VERSION', '1.0.0');
define('DUST_AND_LEAD_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('DUST_AND_LEAD_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include helper classes
require_once DUST_AND_LEAD_PLUGIN_DIR . 'includes/class-dust-and-lead-admin.php';
require_once DUST_AND_LEAD_PLUGIN_DIR . 'includes/class-dust-and-lead-api.php';

class DustAndLeadFPS {
    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Enqueue styles & scripts
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));

        // Register shortcode
        add_shortcode('dust_and_lead_fps', array($this, 'render_game_shortcode'));

        // Register Gutenberg Block
        add_action('init', array($this, 'register_gutenberg_block'));

        // Standalone full-screen page rewrite rule
        add_action('init', array($this, 'add_rewrite_rules'));
        add_filter('query_vars', array($this, 'add_query_vars'));
        // Register template redirect for direct game rendering (bypasses static HTML restrictions)
        add_action('template_redirect', array($this, 'handle_game_request'), 1);
        add_action('template_include', array($this, 'template_redirect_game'));

        // Initialize Admin & REST API
        new DustAndLeadAdmin();
        new DustAndLeadAPI();

        // Register activation hook
        register_activation_hook(__FILE__, array($this, 'plugin_activated'));
    }

    public function plugin_activated() {
        // Add default options
        if (!get_option('dust_and_lead_settings')) {
            update_option('dust_and_lead_settings', array(
                'default_height' => '720px',
                'default_width' => '100%',
                'default_difficulty' => 'gunslinger',
                'enable_fullscreen_btn' => 'yes',
                'allow_highscores' => 'yes',
            ));
        }
        $this->add_rewrite_rules();
        flush_rewrite_rules();
    }

    public function enqueue_frontend_assets() {
        wp_register_style(
            'dust-and-lead-css',
            DUST_AND_LEAD_PLUGIN_URL . 'assets/css/dust-and-lead.css',
            array(),
            DUST_AND_LEAD_VERSION
        );

        wp_register_script(
            'dust-and-lead-embed-js',
            DUST_AND_LEAD_PLUGIN_URL . 'assets/js/dust-and-lead-embed.js',
            array('jquery'),
            DUST_AND_LEAD_VERSION,
            true
        );

        wp_localize_script('dust-and-lead-embed-js', 'dustAndLeadSettings', array(
            'apiUrl' => esc_url_raw(rest_url('dust-and-lead/v1/')),
            'nonce' => wp_create_nonce('wp_rest'),
        ));
    }

    /**
     * Shortcode Handler: [dust_and_lead_fps]
     */
    public function render_game_shortcode($atts) {
        $options = get_option('dust_and_lead_settings', array());

        $default_height = !empty($options['default_height']) ? $options['default_height'] : '720px';
        $default_width = !empty($options['default_width']) ? $options['default_width'] : '100%';

        $a = shortcode_atts(array(
            'width'       => $default_width,
            'height'      => $default_height,
            'difficulty'  => 'gunslinger',
            'sound'       => 'on',
            'fullscreen'  => 'yes',
            'title'       => 'Dust & Lead - 3D Wild West FPS',
            'container_id'=> 'dust-and-lead-' . uniqid(),
            'mode'        => 'wordpress', // 'wordpress' routes through WP template_redirect, 'static' uses direct HTML
        ), $atts, 'dust_and_lead_fps');

        wp_enqueue_style('dust-and-lead-css');
        wp_enqueue_script('dust-and-lead-embed-js');

        if ($a['mode'] === 'static') {
            $game_url = DUST_AND_LEAD_PLUGIN_URL . 'game/index.html';
        } else {
            // WordPress-routed URL: works reliably on every host without 404 issues
            $game_url = add_query_arg(array(
                'dust_and_lead_game' => '1',
                'difficulty'         => sanitize_text_field($a['difficulty']),
                'sound'              => sanitize_text_field($a['sound']),
            ), home_url('/'));
        }

        ob_start();
        ?>
        <div class="dust-and-lead-wrapper" id="<?php echo esc_attr($a['container_id']); ?>" style="width: <?php echo esc_attr($a['width']); ?>; max-width: 100%;">
            <div class="dust-and-lead-header">
                <span class="dust-and-lead-badge">★ Territorial Outpost 1881</span>
                <span class="dust-and-lead-title"><?php echo esc_html($a['title']); ?></span>
                <?php if ($a['fullscreen'] === 'yes'): ?>
                    <button type="button" class="dust-and-lead-fs-btn" data-target="<?php echo esc_attr($a['container_id']); ?>" title="Play in Fullscreen">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                        <span>Fullscreen</span>
                    </button>
                <?php endif; ?>
            </div>

            <div class="dust-and-lead-canvas-container" style="height: <?php echo esc_attr($a['height']); ?>; position: relative;">
                <iframe
                    src="<?php echo esc_url($game_url); ?>"
                    class="dust-and-lead-iframe"
                    allow="pointer-lock; fullscreen; autoplay"
                    tabindex="0"
                    title="<?php echo esc_attr($a['title']); ?>"
                    style="width: 100%; height: 100%; border: none; display: block;"
                ></iframe>
            </div>

            <div class="dust-and-lead-footer">
                <span>WASD Move · Space Jump · Shift Sprint · LMB Shoot · RMB Aim · R Reload · 1-4 Weapons · G Dynamite</span>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Gutenberg Block Registration
     */
    public function register_gutenberg_block() {
        if (!function_exists('register_block_type')) return;

        register_block_type('dust-and-lead/game-block', array(
            'render_callback' => array($this, 'render_game_shortcode'),
            'attributes' => array(
                'width' => array('type' => 'string', 'default' => '100%'),
                'height' => array('type' => 'string', 'default' => '720px'),
                'difficulty' => array('type' => 'string', 'default' => 'gunslinger'),
                'fullscreen' => array('type' => 'string', 'default' => 'yes'),
            ),
        ));
    }

    /**
     * Standalone Full-Viewport Page URL: /dust-and-lead-game/
     */
    public function add_rewrite_rules() {
        add_rewrite_rule('^dust-and-lead-game/?$', 'index.php?dust_and_lead_game=1', 'top');
    }

    public function add_query_vars($vars) {
        $vars[] = 'dust_and_lead_game';
        return $vars;
    }

    public function handle_game_request() {
        if ((isset($_GET['dust_and_lead_game']) && $_GET['dust_and_lead_game'] == '1') || get_query_var('dust_and_lead_game')) {
            $game_file = DUST_AND_LEAD_PLUGIN_DIR . 'game/index.html';
            if (file_exists($game_file)) {
                header('Content-Type: text/html; charset=utf-8');
                header('X-Frame-Options: SAMEORIGIN');
                $html = file_get_contents($game_file);
                // Inject full URL for bundled assets so no relative path resolution fails
                $assets_url = DUST_AND_LEAD_PLUGIN_URL . 'game/assets/';
                $html = str_replace('./assets/', $assets_url, $html);
                $html = str_replace('src="assets/', 'src="' . $assets_url, $html);
                $html = str_replace('href="assets/', 'href="' . $assets_url, $html);
                echo $html;
                exit;
            } else {
                wp_die(__('Game asset bundle missing in dust-and-lead-fps/game. Please reinstall the plugin.', 'dust-and-lead-fps'));
            }
        }
    }

    public function template_redirect_game($template) {
        if (get_query_var('dust_and_lead_game')) {
            $this->handle_game_request();
        }
        return $template;
    }
}

// Instantiate plugin
add_action('plugins_loaded', array('DustAndLeadFPS', 'get_instance'));
