<?php
/**
 * WordPress REST API Endpoints for Dust & Lead
 * Endpoints for retrieving and submitting player bounty high scores.
 */

if (!defined('ABSPATH')) {
    exit;
}

class DustAndLeadAPI {
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        register_rest_route('dust-and-lead/v1', '/scores', array(
            'methods'  => 'GET',
            'callback' => array($this, 'get_scores'),
            'permission_callback' => '__return_true',
        ));

        register_rest_route('dust-and-lead/v1', '/score', array(
            'methods'  => 'POST',
            'callback' => array($this, 'submit_score'),
            'permission_callback' => '__return_true',
        ));
    }

    public function get_scores($request) {
        $leaderboard = get_option('dust_and_lead_leaderboard', array());
        return rest_ensure_response(array(
            'success' => true,
            'scores'  => array_slice($leaderboard, 0, 10),
        ));
    }

    public function submit_score($request) {
        $options = get_option('dust_and_lead_settings', array());
        if (isset($options['allow_highscores']) && $options['allow_highscores'] === 'no') {
            return new WP_Error('disabled', 'High scores disabled', array('status' => 403));
        }

        $params = $request->get_json_params();
        if (empty($params)) {
            $params = $request->get_body_params();
        }

        $name = !empty($params['name']) ? sanitize_text_field($params['name']) : 'Gunslinger ' . rand(100, 999);
        $score = !empty($params['score']) ? intval($params['score']) : 0;
        $wave = !empty($params['wave']) ? intval($params['wave']) : 1;
        $difficulty = !empty($params['difficulty']) ? sanitize_text_field($params['difficulty']) : 'gunslinger';

        if ($score <= 0) {
            return new WP_Error('invalid_score', 'Score must be greater than zero', array('status' => 400));
        }

        $leaderboard = get_option('dust_and_lead_leaderboard', array());

        $leaderboard[] = array(
            'name'       => substr($name, 0, 24),
            'score'      => $score,
            'wave'       => $wave,
            'difficulty' => $difficulty,
            'timestamp'  => current_time('mysql'),
        );

        // Sort by score descending
        usort($leaderboard, function ($a, $b) {
            return $b['score'] - $a['score'];
        });

        // Keep top 25 scores
        $leaderboard = array_slice($leaderboard, 0, 25);
        update_option('dust_and_lead_leaderboard', $leaderboard);

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Bounty registered in the Sheriff ledger!',
            'scores'  => array_slice($leaderboard, 0, 10),
        ));
    }
}
