module.exports = {
  apps: [
    {
      name: "pdhpsyco",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      cwd: "/var/www/pdhpsyco/source",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
