module.exports = {
  apps: [{
    name: "Qualisoft_RD_2030",
    script: "dist/main.js",
    instances: "max", // Mode cluster pour performance maximale
    exec_mode: "cluster",
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 9000
    }
  }]
};