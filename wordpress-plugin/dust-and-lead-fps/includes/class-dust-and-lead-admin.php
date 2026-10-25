<?php
/**
 * WordPress Admin Settings Page & Leaderboard Viewer
 */

if (!defined('ABSPATH')) {
    exit;
}

class DustAndLeadAdmin {
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }

    public function add_admin_menu() {
        add_options_page(
            __('Dust & Lead 3D FPS', 'dust-and-lead-fps'),
            __('Dust & Lead FPS', 'dust-and-lead-fps'),
            'manage_options',
            'dust-and-lead-settings',
            array($this, 'render_admin_page')
        );
    }

    public function register_settings() {
        register_setting('dust_and_lead_options_group', 'dust_and_lead_settings', array($this, 'sanitize_settings'));
    }

    public function sanitize_settings($input) {
        $output = array();
        $output['default_height'] = sanitize_text_field($input['default_height']);
        $output['default_width'] = sanitize_text_field($input['default_width']);
        $output['default_difficulty'] = sanitize_text_field($input['default_difficulty']);
        $output['enable_fullscreen_btn'] = isset($input['enable_fullscreen_btn']) ? 'yes' : 'no';
        $output['allow_highscores'] = isset($input['allow_highscores']) ? 'yes' : 'no';
        return $output;
    }

    public function render_admin_page() {
        $options = get_option('dust_and_lead_settings', array(
            'default_height' => '720px',
            'default_width' => '100%',
            'default_difficulty' => 'gunslinger',
            'enable_fullscreen_btn' => 'yes',
            'allow_highscores' => 'yes',
        ));

        $leaderboard = get_option('dust_and_lead_leaderboard', array());
        ?>
        <div class="wrap" style="max-width: 900px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="background: #25160d; color: #f5ecd5; padding: 24px; border-radius: 6px; margin-bottom: 24px; border-left: 6px solid #c93b28;">
                <h1 style="color: #f5ecd5; margin: 0 0 8px 0; font-family: serif; font-size: 28px; text-transform: uppercase;">
                    ★ Dust & Lead: 3D Wild West FPS
                </h1>
                <p style="margin: 0; opacity: 0.85; font-size: 14px;">
                    Configuration, shortcode builder, and bounty hunter leaderboards for your WordPress site.
                </p>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                <!-- Main Settings Form -->
                <div style="background: #fff; padding: 24px; border-radius: 6px; border: 1px solid #ccd0d4; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <h2 style="margin-top: 0; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 12px;">Display & Gameplay Settings</h2>
                    <form method="post" action="options.php">
                        <?php settings_fields('dust_and_lead_options_group'); ?>

                        <table class="form-table" style="margin-top: 0;">
                            <tr>
                                <th scope="row"><label for="default_height"><?php _e('Default Height', 'dust-and-lead-fps'); ?></label></th>
                                <td>
                                    <input type="text" id="default_height" name="dust_and_lead_settings[default_height]" value="<?php echo esc_attr($options['default_height']); ?>" class="regular-text" placeholder="e.g. 720px or 80vh" />
                                    <p class="description"><?php _e('Default viewport height for shortcode embeds.', 'dust-and-lead-fps'); ?></p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><label for="default_width"><?php _e('Default Width', 'dust-and-lead-fps'); ?></label></th>
                                <td>
                                    <input type="text" id="default_width" name="dust_and_lead_settings[default_width]" value="<?php echo esc_attr($options['default_width']); ?>" class="regular-text" placeholder="e.g. 100%" />
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><label for="default_difficulty"><?php _e('Default Difficulty', 'dust-and-lead-fps'); ?></label></th>
                                <td>
                                    <select id="default_difficulty" name="dust_and_lead_settings[default_difficulty]">
                                        <option value="greenhorn" <?php selected($options['default_difficulty'], 'greenhorn'); ?>>Greenhorn (Casual)</option>
                                        <option value="gunslinger" <?php selected($options['default_difficulty'], 'gunslinger'); ?>>Gunslinger (Normal)</option>
                                        <option value="desperado" <?php selected($options['default_difficulty'], 'desperado'); ?>>Desperado (Hardcore)</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php _e('Fullscreen Button', 'dust-and-lead-fps'); ?></th>
                                <td>
                                    <label>
                                        <input type="checkbox" name="dust_and_lead_settings[enable_fullscreen_btn]" value="yes" <?php checked($options['enable_fullscreen_btn'], 'yes'); ?> />
                                        <?php _e('Show fullscreen button in header bar', 'dust-and-lead-fps'); ?>
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php _e('Bounty Leaderboard', 'dust-and-lead-fps'); ?></th>
                                <td>
                                    <label>
                                        <input type="checkbox" name="dust_and_lead_settings[allow_highscores]" value="yes" <?php checked($options['allow_highscores'], 'yes'); ?> />
                                        <?php _e('Enable REST API score submission and high score tracking', 'dust-and-lead-fps'); ?>
                                    </label>
                                </td>
                            </tr>
                        </table>

                        <?php submit_button(__('Save Changes', 'dust-and-lead-fps')); ?>
                    </form>
                </div>

                <!-- Sidebar: Shortcodes & Info -->
                <div>
                    <div style="background: #fff; padding: 20px; border-radius: 6px; border: 1px solid #ccd0d4; margin-bottom: 20px;">
                        <h3 style="margin-top: 0; font-size: 16px; color: #1d2327;">📋 Embed Shortcode</h3>
                        <p style="font-size: 13px; color: #646970;">Paste this shortcode into any WordPress Post, Page, or Widget:</p>
                        <code style="display: block; background: #f0f0f1; padding: 10px; border-radius: 4px; font-size: 12px; margin-bottom: 12px; word-break: break-all;">
                            [dust_and_lead_fps]
                        </code>

                        <p style="font-size: 12px; font-weight: 600; margin-bottom: 4px;">Custom attributes:</p>
                        <code style="display: block; background: #f0f0f1; padding: 8px; border-radius: 4px; font-size: 11px; margin-bottom: 8px;">
                            [dust_and_lead_fps height="800px" difficulty="desperado"]
                        </code>

                        <p style="font-size: 12px; margin-top: 14px;">
                            <strong>Dedicated Fullscreen URL:</strong><br />
                            <a href="<?php echo esc_url(home_url('/dust-and-lead-game/')); ?>" target="_blank" style="text-decoration: underline;">
                                <?php echo esc_html(home_url('/dust-and-lead-game/')); ?>
                            </a>
                        </p>
                    </div>

                    <!-- Top Bounties Widget -->
                    <div style="background: #fff; padding: 20px; border-radius: 6px; border: 1px solid #ccd0d4;">
                        <h3 style="margin-top: 0; font-size: 16px; color: #1d2327;">🏆 Bounty Hall of Fame</h3>
                        <?php if (empty($leaderboard)): ?>
                            <p style="font-size: 13px; color: #8c8f94; font-style: italic;">No bounty scores registered yet. Shoot down some bandits to make the board!</p>
                        <?php else: ?>
                            <ul style="margin: 0; padding: 0; list-style: none;">
                                <?php foreach (array_slice($leaderboard, 0, 5) as $idx => $entry): ?>
                                    <li style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f1; font-size: 13px;">
                                        <span><strong>#<?php echo ($idx + 1); ?></strong> <?php echo esc_html($entry['name']); ?></span>
                                        <span style="font-weight: 600; color: #1e7e34;">$<?php echo number_format(intval($entry['score'])); ?></span>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
}
