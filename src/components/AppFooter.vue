<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-divider"></div>
      <div class="footer-links">
        <router-link to="/404" class="footer-link">404 页面</router-link>
        <span class="footer-separator">|</span>
        <router-link to="/500" class="footer-link">500 页面</router-link>
      </div>
      <div class="footer-meta">
        <span class="footer-brand">iBlog</span>
        <span class="footer-dot">©</span>
        <span>{{ year }}</span>
        <span class="footer-dot">·</span>
        <span class="footer-slogan">在代码与文字之间记录灵感</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  width: 100%;
  padding: 16px 0 20px;
  margin-top: 24px;
  background: radial-gradient(circle at top, rgba(196, 181, 253, 0.06), transparent 55%);
}

.footer-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
}

.footer-divider {
  height: 1px;
  margin-bottom: 12px;
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.4), transparent);
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.footer-link {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #667eea;
}

.footer-separator {
  color: #d1d5db;
}

.footer-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.footer-brand {
  font-family: 'Dancing Script', cursive;
  font-size: 16px;
  background: linear-gradient(120deg, #667eea, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.footer-dot {
  padding: 0 2px;
}

.footer-slogan {
  color: #a0aec0;
}
</style>

