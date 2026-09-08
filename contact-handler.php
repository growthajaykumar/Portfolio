<?php
/**
 * Optional server-side contact handler for Hostinger (PHP is enabled by default).
 *
 * TO ENABLE:
 *   1. Change TO_EMAIL below to the inbox you want enquiries in.
 *   2. Open /assets/js/main.js and set  var USE_PHP = true;
 *   3. Re-upload both files.
 *
 * If you leave it disabled, the form opens the visitor's email app instead —
 * which works everywhere and needs no server at all.
 */

declare(strict_types=1);

const TO_EMAIL   = 'ajay@growthwithajay.com';   // <-- change me
const SITE_NAME  = 'Growth with Ajay';
const FROM_EMAIL = 'noreply@growthwithajay.com'; // must be on your domain for deliverability

header('Content-Type: text/plain; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

// Honeypot — bots fill hidden fields
if (!empty($_POST['company_website'] ?? '')) {
    exit('OK');
}

function clean(string $key, int $max = 2000): string {
    $v = trim((string)($_POST[$key] ?? ''));
    $v = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $v); // header-injection guard
    return mb_substr($v, 0, $max);
}

$name    = clean('name', 120);
$email   = filter_var(trim((string)($_POST['email'] ?? '')), FILTER_VALIDATE_EMAIL);
$company = clean('company', 160);
$service = clean('service', 120);
$budget  = clean('budget', 120);
$message = trim((string)($_POST['message'] ?? ''));
$message = mb_substr($message, 0, 5000);

if ($name === '' || $email === false || $message === '') {
    http_response_code(422);
    exit('Please fill in your name, a valid email and a message.');
}

$subject = sprintf('[%s] New enquiry — %s — %s', SITE_NAME, $service ?: 'General', $name);

$body = "New enquiry from the website\n"
      . str_repeat('-', 40) . "\n"
      . "Name:    {$name}\n"
      . "Email:   {$email}\n"
      . "Company: " . ($company ?: '—') . "\n"
      . "Service: " . ($service ?: '—') . "\n"
      . "Budget:  " . ($budget ?: '—') . "\n"
      . str_repeat('-', 40) . "\n\n"
      . $message . "\n\n"
      . str_repeat('-', 40) . "\n"
      . 'Sent: ' . date('Y-m-d H:i:s') . "\n"
      . 'IP:   ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

$headers = [
    'From: ' . SITE_NAME . ' <' . FROM_EMAIL . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

if (@mail(TO_EMAIL, $subject, $body, implode("\r\n", $headers))) {
    exit('OK');
}

http_response_code(500);
exit('Could not send. Please email ' . TO_EMAIL . ' directly.');
