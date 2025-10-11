<?php
/**
 * Simple script to display your server's IP address
 * Upload this to your server and access it via browser
 * Then use this IP in Google Cloud Console API restrictions
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Server IP Address</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .info-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .ip {
            font-size: 24px;
            font-weight: bold;
            color: #ff4500;
            margin: 20px 0;
        }
        .label {
            color: #666;
            font-size: 14px;
        }
        code {
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="info-box">
        <h2>Server Information</h2>
        
        <div class="label">Server IP Address (for API restrictions):</div>
        <div class="ip"><?php echo $_SERVER['SERVER_ADDR'] ?? 'Unable to detect'; ?></div>
        
        <div class="label">Outbound IP (what external APIs see):</div>
        <div class="ip">
            <?php
            // Try to get the outbound IP by making an external request
            $outbound_ip = @file_get_contents('https://api.ipify.org');
            echo $outbound_ip ?: 'Unable to detect';
            ?>
        </div>
        
        <hr style="margin: 30px 0;">
        
        <h3>Instructions:</h3>
        <ol>
            <li>Copy the <strong>Outbound IP</strong> address above</li>
            <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Google Cloud Console</a></li>
            <li>Edit your API key</li>
            <li>Change restriction to "IP addresses"</li>
            <li>Add the IP address shown above</li>
            <li>Save changes</li>
            <li>Wait 1-2 minutes for changes to propagate</li>
            <li>Delete this file for security</li>
        </ol>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
            <strong>Security Note:</strong> Delete this file after getting your IP address.
        </p>
    </div>
</body>
</html>
