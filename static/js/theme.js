// 主题切换功能
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("themeToggle");
    this.prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    this.init();
  }

  init() {
    // 监听系统主题变化
    this.prefersDark.addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        this.setTheme(e.matches ? "dark" : "light");
      }
    });

    // 从本地存储获取主题或使用系统偏好
    const savedTheme = localStorage.getItem("theme");
    const initialTheme =
      savedTheme || (this.prefersDark.matches ? "dark" : "light");

    this.setTheme(initialTheme);

    // 绑定切换事件
    this.themeToggle.addEventListener("click", () => {
      this.toggleTheme();
    });

    // 键盘快捷键支持 (Ctrl/Cmd + Shift + L)
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "L") {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // 更新按钮 aria-label
    this.themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "切换到亮色模式" : "切换到暗色模式"
    );

    // 添加切换动画效果
    this.addSwitchEffect();
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  }

  addSwitchEffect() {
    // 添加页面切换动画效果
    document.body.style.transition = "none";
    setTimeout(() => {
      document.body.style.transition = "";
    }, 50);

    // 按钮动画效果
    this.themeToggle.style.transform = "scale(0.95)";
    setTimeout(() => {
      this.themeToggle.style.transform = "";
    }, 150);
  }
}

// 页面加载完成后初始化主题管理器
document.addEventListener("DOMContentLoaded", () => {
  new ThemeManager();
});

// 平滑滚动效果
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

// 卡片悬停效果增强
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-8px) scale(1.02)";
  });

  card.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0) scale(1)";
  });
});

// 性能优化：防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 滚动时的视差效果
const handleScroll = debounce(() => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector(".hero");
  if (hero) {
    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
}, 10);

window.addEventListener("scroll", handleScroll);

// 检查是否按下了 Home、End 键
document.addEventListener('keydown', function(event) {
    if (event.key === 'Home' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        window.scrollTo(0, 0);
    }
    if (event.key === 'End' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        window.scrollTo(0, document.body.scrollHeight);
    }
});
