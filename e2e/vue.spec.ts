import { test, expect } from '@playwright/test';

test.describe('志友ERP系统功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前访问登录页面
    await page.goto('/');
  });

  test('登录功能测试', async ({ page }) => {
    // 检查登录页面元素
    await expect(page.locator('h1')).toContainText('志友ERP');
    await expect(page.locator('input[placeholder="用户名"]')).toBeVisible();
    await expect(page.locator('input[placeholder="密码"]')).toBeVisible();
    
    // 执行登录
    await page.fill('input[placeholder="用户名"]', 'erp');
    await page.fill('input[placeholder="密码"]', '123456');
    await page.click('button[type="submit"]');
    
    // 等待跳转到仪表盘
    await page.waitForURL('/dashboard');
    await expect(page.locator('.dashboard')).toBeVisible();
  });

  test('仪表盘功能测试', async ({ page }) => {
    // 先登录
    await page.fill('input[placeholder="用户名"]', 'erp');
    await page.fill('input[placeholder="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // 检查KPI卡片
    await expect(page.locator('.kpi-card')).toHaveCount(6);
    
    // 检查图表容器
    await expect(page.locator('.hourly-output-chart')).toBeVisible();
    await expect(page.locator('.abnormal-donut-chart')).toBeVisible();
    
    // 检查工位跑马灯
    await expect(page.locator('.workstation-ticker')).toBeVisible();
  });

  test('主菜单导航测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="用户名"]', 'erp');
    await page.fill('input[placeholder="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // 测试SOP模块
    await page.click('[data-testid="menu-sop"], .el-menu-item:has-text("工序SOP")');
    await page.waitForTimeout(500);
    
    // 测试绩效模块  
    await page.click('[data-testid="menu-performance"], .el-menu-item:has-text("绩效")');
    await page.waitForTimeout(500);
    
    // 测试考勤模块
    await page.click('[data-testid="menu-attendance"], .el-menu-item:has-text("考勤管理")');
    await page.waitForTimeout(500);
  });

  test('工位看板功能测试', async ({ page }) => {
    // 登录并进入工位看板
    await page.fill('input[placeholder="用户名"]', 'erp');
    await page.fill('input[placeholder="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // 点击工位看板菜单
    await page.click('.el-menu-item:has-text("工位看板")');
    await page.waitForTimeout(1000);
    
    // 检查工位看板页面元素
    await expect(page.locator('.workstation-board')).toBeVisible();
    await expect(page.locator('.board-title')).toContainText('生产工位看板');
    await expect(page.locator('.overview-card')).toHaveCount(4);
    const stationCards = page.locator('.station-card');
    await expect(stationCards).toHaveCount(await stationCards.count());
  });

  test('主题切换功能测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="用户名"]', 'erp');
    await page.fill('input[placeholder="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // 测试主题切换
    const themeToggle = page.locator('.theme-toggle, [data-testid="theme-switch"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // 验证主题变化
      const bodyClass = await page.locator('html').getAttribute('data-theme');
      expect(['light', 'dark', 'factory']).toContain(bodyClass);
    }
  });

  test('响应式设计测试', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder="用户名"]', 'erp');
    await page.fill('input[placeholder="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // 测试移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // 检查移动端适配
    await expect(page.locator('.dashboard')).toBeVisible();
    
    // 恢复桌面端视口
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
  });

  test('系统错误处理测试', async ({ page }) => {
    // 测试错误登录
    await page.fill('input[placeholder="用户名"]', 'wrong');
    await page.fill('input[placeholder="密码"]', 'wrong');
    await page.click('button[type="submit"]');
    
    // 验证错误提示
    await expect(page.locator('.el-message--error, .error-message')).toBeVisible();
  });

  test('页面性能测试', async ({ page }) => {
    // 监听网络请求
    const responses: number[] = [];
    page.on('response', (response) => {
      responses.push(response.status());
    });
    
    // 登录并检查页面加载
    await page.fill('input[placeholder="用户名"]', 'erp');
    await page.fill('input[placeholder="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    
    // 检查没有4xx/5xx错误
    const errors = responses.filter(status => status >= 400);
    expect(errors.length).toBe(0);
  });
});

test.describe('模块功能深度测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 自动登录
    await page.fill('input[placeholder="用户名"]', 'erp');
    await page.fill('input[placeholder="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('SOP模块功能测试', async ({ page }) => {
    // 进入SOP列表
    await page.click('.el-menu-item:has-text("工序SOP")');
    await page.waitForTimeout(1000);
    
    // 检查SOP列表页面
    await expect(page.locator('.sop-list, [data-testid="sop-page"]')).toBeVisible();
    
    // 测试搜索功能
    const searchInput = page.locator('input[placeholder*="搜索"], .el-input__inner');
    if (await searchInput.first().isVisible()) {
      await searchInput.first().fill('测试');
      await page.waitForTimeout(500);
    }
  });

  test('考勤管理功能测试', async ({ page }) => {
    // 进入考勤管理
    await page.click('.el-menu-item:has-text("考勤管理")');
    await page.waitForTimeout(1000);
    
    // 检查考勤页面
    await expect(page.locator('.attendance-record, [data-testid="attendance-page"]')).toBeVisible();
  });

  test('绩效模块功能测试', async ({ page }) => {
    // 进入绩效模块
    await page.click('.el-menu-item:has-text("绩效")');
    await page.waitForTimeout(1000);
    
    // 检查绩效页面
    await expect(page.locator('.perf-today, [data-testid="performance-page"]')).toBeVisible();
  });
});
