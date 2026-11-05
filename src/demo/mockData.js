/**
 * 演示模式用的假数据
 * 仅在 VITE_DEMO_MODE=true 时被 adapter 引用，真实开发/生产环境完全不会加载
 */

/* ---------- 封面与人像：全部用内联 SVG，零网络请求 ---------- */

function svgCover(from, to, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="440" viewBox="0 0 800 440">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
</linearGradient>
</defs>
<rect width="800" height="440" fill="url(#g)"/>
<g fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="1.5">
<circle cx="672" cy="86" r="132"/><circle cx="672" cy="86" r="86"/><circle cx="118" cy="392" r="168"/>
</g>
<g fill="#ffffff" fill-opacity="0.1">
<circle cx="700" cy="360" r="5"/><circle cx="640" cy="404" r="3"/><circle cx="748" cy="300" r="3"/>
</g>
<text x="52" y="316" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="42" font-weight="700" fill="#ffffff" fill-opacity="0.95">${label}</text>
<text x="54" y="352" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="16" letter-spacing="4" fill="#ffffff" fill-opacity="0.6">IBLOG · ENGINEERING NOTES</text>
</svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

function svgAvatar(letter, from, to) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
<rect width="96" height="96" rx="48" fill="url(#a)"/>
<text x="48" y="62" text-anchor="middle" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="38" font-weight="600" fill="#ffffff">${letter}</text>
</svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

/* ---------- 基础数据 ---------- */

export const DEMO_USER_ID = '1'
export const DEMO_TOKEN = 'demo.mock.token.' + btoa('{"sub":"1","roleId":1}')

export const currentUser = {
  id: DEMO_USER_ID,
  userId: DEMO_USER_ID,
  username: 'admin',
  nickname: '晓知',
  email: 'admin@iblog.dev',
  avatarUrl: svgAvatar('晓', '#6366f1', '#8b5cf6'),
  gender: '男',
  motto: '把每一次踩坑都写成文档',
  bio: '后端工程师 / 微服务实践者，喜欢把复杂系统拆成能讲清楚的小块。',
  roleId: 1,
  status: 0,
  createTime: '2025-03-18 10:24:00'
}

export const categories = [
  { id: 1, name: '后端架构', description: '微服务、分层设计与工程实践', blogCount: 4 },
  { id: 2, name: '中间件', description: 'Redis / MQ / 搜索引擎', blogCount: 3 },
  { id: 3, name: '数据库', description: 'MySQL 优化与事务', blogCount: 2 },
  { id: 4, name: '前端工程', description: 'Vue3 与组件化', blogCount: 2 },
  { id: 5, name: '效率工具', description: '开发流程与工具链', blogCount: 1 }
]

export const tags = [
  { id: 1, name: 'Spring Cloud', blogCount: 4 },
  { id: 2, name: 'Nacos', blogCount: 2 },
  { id: 3, name: 'Redis', blogCount: 3 },
  { id: 4, name: 'RocketMQ', blogCount: 2 },
  { id: 5, name: 'Elasticsearch', blogCount: 2 },
  { id: 6, name: 'Seata', blogCount: 1 },
  { id: 7, name: 'JWT', blogCount: 2 },
  { id: 8, name: 'Vue3', blogCount: 2 },
  { id: 9, name: 'AI', blogCount: 1 },
  { id: 10, name: '性能优化', blogCount: 2 }
]

/* ---------- 文章正文 ---------- */

const A1 = `
<p class="lead">一个人维护的后端项目，最容易烂在「什么都写在一个 Spring Boot 里」。等到用户、文章、评论、检索、AI 全塞进一个进程，改一行代码要重启四十秒，部署一次心里发慌。</p>
<h2>为什么要拆</h2>
<p>拆分的判断标准不是「微服务听起来高级」，而是<strong>变更频率和故障域是否真的可以分开</strong>。这个博客系统里，我列了三条真实的边界：</p>
<ul>
<li>用户与会话：登录、注册、改密，安全相关，改动最少但要求最稳；</li>
<li>内容域：文章、分类、标签，写多读多，是业务主体；</li>
<li>检索与 AI：依赖外部组件（ES、大模型），最容易超时，不该拖垮主站。</li>
</ul>
<h2>最终的模块划分</h2>
<p>七个服务，各自一个独立数据库 schema：</p>
<pre><code class="language-text">blog/
├── gateway-service     统一入口、JWT 校验、限流
├── user-service        用户、鉴权、邮箱验证码
├── blog-service        文章、分类、标签
├── comment-service     评论与回复
├── document-service    OSS 文件上传
├── search-service      Elasticsearch 检索
└── ai-service          通义千问：标题 / 摘要 / 润色</code></pre>
<h3>不拆什么</h3>
<p>有三样东西我坚持没有拆：</p>
<ul>
<li><strong>认证逻辑</strong>放进网关而不是每个服务各写一遍；</li>
<li><strong>公共 DTO 与异常</strong>做成 common 包，避免七个仓库各自定义一遍 Result；</li>
<li><strong>本地开发环境</strong>不搞容器编排，一个 <code>start-all.cmd</code> 按序拉起就够了。</li>
</ul>
<h2>踩到的第一个坑：端口被环境变量劫持</h2>
<p>七个服务同时启动，日志里全是 <code>port 50440 already in use</code>。查了半天才发现宿主机注入了一个叫 <code>SERVER__PORT</code> 的环境变量，Spring Boot 的宽松绑定把它当成了 <code>server.port</code>。</p>
<blockquote>Spring Boot 的环境变量绑定规则：<code>SERVER_PORT</code> 和下划线形式都会被映射到 <code>server.port</code>。这个特性在容器里很方便，在本地却很容易变成幽灵 bug。</blockquote>
<h2>小结</h2>
<p>拆微服务真正省下的不是代码量，而是<strong>变更的影响半径</strong>。如果拆完之后每个需求还是要同时改五个服务，那说明边界画错了。</p>
`

const A2 = `
<p class="lead">Nacos 装起来两分钟，跑起来一堆坑。这篇记的是我在 Windows 本地把七个服务都注册上去时遇到的实际问题。</p>
<h2>服务注册不上去的三个原因</h2>
<h3>1. 只加了 discovery，忘了 bootstrap</h3>
<p>Spring Cloud 2021 之后 <code>bootstrap.yml</code> 默认不加载，需要额外依赖 <code>spring-cloud-starter-bootstrap</code>。否则你在 bootstrap 里写的 Nacos 地址根本不会被读到。</p>
<h3>2. 命名空间与分组不一致</h3>
<p>控制台上的命名空间 ID 是一串 UUID，不是你在页面上起的名字。配置写错一个字母，服务就会注册到 public 下，然后在别的命名空间里永远发现不了它。</p>
<pre><code class="language-yaml">spring:
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
        namespace: 8f4a1c2e-1b3d-4a5f-9c7e-2d6b8a0f1c3e
        group: DEFAULT_GROUP</code></pre>
<h3>3. 瞬时实例被健康检查踢掉</h3>
<p>本地机器内存吃紧时，服务启动慢，心跳没跟上，Nacos 会先把实例标记为不健康。表现就是网关间歇性 503。</p>
<h2>一个能省半小时的排查顺序</h2>
<ol>
<li>先看 Nacos 控制台「服务管理 → 服务列表」，确认实例数和健康状态；</li>
<li>再直接 curl 提供者的端口，绕开网关和发现；</li>
<li>最后才怀疑网关路由和负载均衡。</li>
</ol>
<p>顺序反过来，就会在网关层浪费大量时间——因为网关的报错永远是「找不到可用实例」，它不会告诉你原因。</p>
<h2>Consumer 端要记得开重试</h2>
<pre><code class="language-yaml">spring:
  cloud:
    loadbalancer:
      retry:
        enabled: true
        max-retries-on-same-service-instance: 1
        max-retries-on-next-service-instance: 2</code></pre>
<blockquote>实例刚下线的那几十秒，没有重试就会把一次正常的滚动发布变成用户可见的 500。</blockquote>
`

const A3 = `
<p class="lead">网关做鉴权最省事的写法是「每个下游服务自己解析 JWT」，但那等于把安全策略复制了七份。这篇讲我怎么把它收敛到网关一层。</p>
<h2>鉴权放在哪一层</h2>
<p>结论：<strong>身份识别在网关，权限判断在服务</strong>。网关负责把 token 换成可信的用户身份，并通过内部请求头传给下游；服务不再解析 token，只读身份头。</p>
<pre><code class="language-java">public class AuthGlobalFilter implements GlobalFilter, Ordered {
    @Override
    public Mono&lt;Void&gt; filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        Claims claims = JwtUtil.parse(token.substring(7));
        ServerHttpRequest request = exchange.getRequest().mutate()
                .header("X-User-Id", claims.getSubject())
                .header("X-User-Role", String.valueOf(claims.get("roleId")))
                .header("X-Internal-Auth", sign(claims.getSubject()))
                .build();
        return chain.filter(exchange.mutate().request(request).build());
    }
}</code></pre>
<h2>内部请求头必须能防伪造</h2>
<p>如果下游直接信任 <code>X-User-Id</code>，那么任何能直连服务端口的人都能冒充管理员。所以要加一道内部签名：</p>
<ul>
<li>网关用共享密钥对 <code>userId + timestamp</code> 做 HMAC；</li>
<li>服务端校验签名和时效（比如 60 秒内）；</li>
<li>服务端口不对公网暴露，只允许内网访问。</li>
</ul>
<h3>白名单怎么设计</h3>
<p>登录、注册、验证码、文章列表和详情这些必须匿名可访问。我的做法是把白名单写在配置里，而不是硬编码在 filter 中：</p>
<pre><code class="language-yaml">gateway:
  auth:
    whitelist:
      - /api/user/login
      - /api/user/register/**
      - /api/blog/list
      - /api/blog/detail/**</code></pre>
<h2>刷新令牌的两个细节</h2>
<p>第一，refresh token 存在 HttpOnly Cookie 里，前端完全接触不到，XSS 也偷不走。第二，刷新接口本身必须跳过 token 校验，否则过期之后永远刷不了。</p>
<blockquote>顺带一提：并发刷新要做单例锁。三个接口同时 401，不能让它们同时发三次刷新请求，否则最早那次刷出来的 token 会被后一次覆盖掉。</blockquote>
`

const A4 = `
<p class="lead">缓存穿透、击穿、雪崩是被讲烂的三个词，但真正落到代码里，很多人只会加一个空值缓存就以为万事大吉。</p>
<h2>三者到底差在哪</h2>
<table><thead><tr><th>问题</th><th>触发条件</th><th>典型表现</th></tr></thead>
<tbody>
<tr><td>穿透</td><td>查询根本不存在的数据</td><td>请求全部打到 DB，缓存形同虚设</td></tr>
<tr><td>击穿</td><td>某个热点 key 恰好过期</td><td>瞬时大量请求打同一行</td></tr>
<tr><td>雪崩</td><td>大批 key 同时过期或 Redis 挂掉</td><td>DB 直接被压垮</td></tr>
</tbody></table>
<h2>穿透：布隆过滤器 + 空值缓存</h2>
<p>空值缓存简单有效，但要记得给一个比较短的 TTL，比如 60 秒，否则恶意用随机 ID 攻击会把 Redis 塞满垃圾。</p>
<pre><code class="language-java">String key = "blog:detail:" + id;
String cached = redis.get(key);
if (cached != null) {
    return cached.isEmpty() ? null : JSON.parseObject(cached, Blog.class);
}
if (!bloomFilter.mightContain(id)) {
    return null;                    // 一定不存在，直接短路
}
Blog blog = blogMapper.selectById(id);
redis.set(key, blog == null ? "" : JSON.toJSONString(blog), 60, TimeUnit.SECONDS);
return blog;</code></pre>
<h2>击穿：互斥重建</h2>
<p>热点 key 过期的瞬间只放一个线程去查库，其余线程短暂阻塞等待。注意等待线程要有超时兜底，否则第一个线程挂了会把后面全拖死。</p>
<h2>雪崩：过期时间打散</h2>
<p>最便宜的做法是给 TTL 加随机量：</p>
<pre><code class="language-java">long ttl = 1800 + ThreadLocalRandom.current().nextLong(300);</code></pre>
<p>再往上就是多级缓存（本地 Caffeine + Redis）和 Redis 高可用。前者能把热点挡在进程内，量级下来一个数量级。</p>
<blockquote>不要为了这三个词上 Redisson 分布式锁——大多数博客场景的并发量，一个 <code>SETNX</code> 加超时就够了。</blockquote>
`

const A5 = `
<p class="lead">用户改了昵称或头像，需要同步到文章列表、评论、ES 索引里展示的作者信息。如果同步写在业务代码里，一个改资料的动作要串行调三四个服务。</p>
<h2>用事件解耦</h2>
<p>做法很简单：用户服务在事务提交后发一条事件，其余服务各自订阅。</p>
<pre><code class="language-java">@Transactional
public void updateProfile(UpdateDTO dto) {
    userMapper.update(dto);
    // 事务提交后再发，避免消息先到、数据未提交导致消费端查不到新值
    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
            @Override public void afterCommit() {
                rocketMQTemplate.syncSend("user-profile-topic",
                    MessageBuilder.withPayload(new ProfileChangedEvent(userId)).build());
            }
        });
}</code></pre>
<h2>三个必须处理的问题</h2>
<h3>1. 消息必须在事务提交后发送</h3>
<p>写在事务里的 <code>send</code> 有概率先于 commit 到达消费端，消费端查库还是旧值，同步就成了脏数据。用 <code>afterCommit</code> 或者本地消息表都能解决。</p>
<h3>2. 消费端要幂等</h3>
<p>MQ 至少一次投递，同一条事件可能来两次。更新操作天然幂等；如果是累加类的统计，就要靠事件 ID 去重。</p>
<h3>3. 消费失败不能无限重试</h3>
<p>重试十六次之后进死信队列，然后人工或者定时任务补偿。本地开发时如果 broker 没起来，消费端 Bean 初始化会直接超时，整个服务起不来——这就是为什么启动顺序里 MQ 必须在前面。</p>
<blockquote>另外：broker 默认会把自己的 IP 注册成第一个非回环网卡地址。笔记本上有虚拟网卡时，它会注册成 <code>172.x.x.x</code>，本机服务连过去可能直接超时。启动时显式指定 <code>brokerIP1=127.0.0.1</code>。</blockquote>
`

const A6 = `
<p class="lead">MySQL 的 <code>LIKE '%关键词%'</code> 在数据量上来之后必然全表扫描。博客的搜索又恰恰最需要模糊匹配、分词和相关度排序。</p>
<h2>索引结构</h2>
<pre><code class="language-json">{
  "mappings": {
    "properties": {
      "title":   { "type": "text", "analyzer": "ik_max_word", "boost": 3 },
      "summary": { "type": "text", "analyzer": "ik_max_word" },
      "content": { "type": "text", "analyzer": "ik_max_word" },
      "tags":    { "type": "keyword" },
      "status":  { "type": "integer" },
      "createTime": { "type": "date" }
    }
  }
}</code></pre>
<p>标题权重给到 3，摘要 1，正文 1，这样搜「缓存」时标题命中会排在前面。</p>
<h2>中文分词选 ik 还是默认</h2>
<p>默认的 <code>standard</code> 分词器会把中文切成单字，「微服务」会变成「微」「服」「务」三个词，召回率高但相关度很差。<code>ik_max_word</code> 索引时细粒度、<code>ik_smart</code> 查询时粗粒度，是常见组合。</p>
<h2>高亮与分页</h2>
<pre><code class="language-java">SearchSourceBuilder builder = new SearchSourceBuilder()
    .query(QueryBuilders.multiMatchQuery(keyword, "title^3", "summary", "content"))
    .highlighter(new HighlightBuilder()
        .field("title").field("summary")
        .preTags("&lt;em class=\\"hl\\"&gt;").postTags("&lt;/em&gt;"))
    .from((pageNum - 1) * pageSize)
    .size(pageSize);</code></pre>
<blockquote>深分页不要用 <code>from + size</code>。翻到一万条以后改用 <code>search_after</code>，配合一个稳定的排序字段。</blockquote>
<h2>索引同步</h2>
<p>写操作走 MQ 发一条 <code>blog-index-topic</code>，检索服务消费后 upsert 到 ES。全量重建用一个定时任务，按 ID 游标分批拉，不要一次性 scroll 全表。</p>
`

const A7 = `
<p class="lead">「下单扣库存 + 写订单」这种跨库操作才需要分布式事务。博客系统里真正需要它的地方其实很少，但发布文章这一条链路确实需要。</p>
<h2>为什么需要</h2>
<p>发布文章要同时：写 <code>blog</code> 表、写 <code>blog_tag</code> 关联表、给用户表加文章数、发一条索引同步事件。前三个在不同库，中间失败就出现「文章存在但标签丢了」的脏数据。</p>
<h2>AT 模式的两个阶段</h2>
<ol>
<li>一阶段：业务 SQL 和 undo_log 在同一个本地事务里提交，直接落库不锁行；</li>
<li>二阶段：全局提交就删 undo_log；全局回滚就根据 undo_log 反向补偿。</li>
</ol>
<p>好处是业务代码几乎零侵入，只需要一个 <code>@GlobalTransactional</code>。</p>
<pre><code class="language-java">@GlobalTransactional(name = "publish-blog", rollbackFor = Exception.class)
public Long publish(BlogDTO dto) {
    Long blogId = blogService.save(dto);
    tagService.bind(blogId, dto.getTags());
    userService.incrBlogCount(dto.getAuthorId());
    return blogId;
}</code></pre>
<h2>代价是什么</h2>
<ul>
<li>每条写 SQL 都多一次 undo_log 写入，QPS 会掉；</li>
<li>需要额外的 TC 服务（Seata Server）常驻；</li>
<li>全局锁竞争在热点行上会很明显。</li>
</ul>
<blockquote>所以我的原则是：能用「本地事务 + 最终一致」解决的，绝不上 Seata。发布文章这种强一致要求高的才用。</blockquote>
`

const A8 = `
<p class="lead">接入大模型最容易犯的错，是把整篇文章丢进去让它「润色一下」，然后得到一个语气变得不像自己的版本。AI 在写作流程里更适合做小颗粒度的辅助。</p>
<h2>三个真正有用的场景</h2>
<h3>1. 起标题</h3>
<p>输入正文前两千字，要求「输出 5 个不超过 20 字的标题，风格克制，不要感叹号」。限制输出长度能显著减少跑题。</p>
<h3>2. 写摘要</h3>
<p>摘要用流式返回，边生成边渲染，用户的感知等待从 6 秒降到 1 秒以内。</p>
<pre><code class="language-java">@PostMapping(value = "/summary/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux&lt;String&gt; summary(@RequestBody ContentDTO dto) {
    return chatClient.prompt()
        .system("你是技术博客编辑，用 120 字以内概括核心结论，不要分点")
        .user(dto.getContent())
        .stream()
        .content();
}</code></pre>
<h3>3. 选区改写</h3>
<p>选中一段话 → 给出指令（「更简洁」「补一个例子」）→ 流式替换。关键是<strong>只传选区和前后各 200 字上下文</strong>，既省 token，也避免模型擅自改动别处。</p>
<h2>工程上要注意的</h2>
<ul>
<li>API Key 必须走环境变量，绝不能进仓库——我在这件事上吃过亏；</li>
<li>流式接口要有超时和首字节超时，模型排队时前端不能一直空转；</li>
<li>生成结果一律作为<strong>建议</strong>填进输入框，由人确认，不直接落库。</li>
</ul>
<blockquote>还有一个现实问题：正文质量太差时模型会「编」。所以我在 prompt 里加了兜底——内容不足以概括时直接返回「无法生成摘要」，前端据此提示用户。</blockquote>
`

/* ---------- 文章列表 ---------- */

const rawArticles = [
  {
    id: '1',
    title: '我把一个博客拆成了 7 个微服务，然后后悔了吗',
    summary: '一个人维护的后端项目最容易烂在单体里。这篇讲我怎么划边界、拆了哪七个服务，以及拆完之后到底省下了什么。',
    content: A1,
    categoryId: 1,
    categoryName: '后端架构',
    tags: ['Spring Cloud', '架构设计'],
    cover: svgCover('#6366f1', '#8b5cf6', 'Microservices'),
    authorName: '晓知',
    authorAvatar: svgAvatar('晓', '#6366f1', '#8b5cf6'),
    createTime: '2026-10-28 21:14:00',
    viewCount: 2841,
    likeCount: 168,
    collectCount: 92
  },
  {
    id: '2',
    title: 'Nacos 服务注册踩坑实录：七个服务只上去了三个',
    summary: 'bootstrap 没加载、命名空间 ID 写成了名字、心跳被健康检查踢掉——本地跑 Nacos 最常见的三个坑。',
    content: A2,
    categoryId: 1,
    categoryName: '后端架构',
    tags: ['Nacos', 'Spring Cloud'],
    cover: svgCover('#0ea5e9', '#2563eb', 'Nacos'),
    authorName: '晓知',
    authorAvatar: svgAvatar('晓', '#6366f1', '#8b5cf6'),
    createTime: '2026-10-22 19:02:00',
    viewCount: 1932,
    likeCount: 121,
    collectCount: 74
  },
  {
    id: '3',
    title: '把 JWT 鉴权收敛到网关：一次删掉七份重复代码',
    summary: '身份识别在网关，权限判断在服务。附内部请求头防伪造、刷新令牌单例锁的具体实现。',
    content: A3,
    categoryId: 1,
    categoryName: '后端架构',
    tags: ['JWT', 'Spring Cloud', '安全'],
    cover: svgCover('#f59e0b', '#ef4444', 'Gateway Auth'),
    authorName: '晓知',
    authorAvatar: svgAvatar('晓', '#6366f1', '#8b5cf6'),
    createTime: '2026-10-16 22:40:00',
    viewCount: 3157,
    likeCount: 204,
    collectCount: 131
  },
  {
    id: '4',
    title: '缓存穿透、击穿、雪崩：别再只会加空值缓存了',
    summary: '三个词被讲烂了，但落到代码里差别很大。布隆过滤器、互斥重建、TTL 打散，逐个给出可用的写法。',
    content: A4,
    categoryId: 2,
    categoryName: '中间件',
    tags: ['Redis', '性能优化'],
    cover: svgCover('#ef4444', '#b91c1c', 'Redis Cache'),
    authorName: '晓知',
    authorAvatar: svgAvatar('晓', '#6366f1', '#8b5cf6'),
    createTime: '2026-10-09 20:18:00',
    viewCount: 4216,
    likeCount: 287,
    collectCount: 196
  },
  {
    id: '5',
    title: 'RocketMQ 异步事件：改个昵称为什么要发消息',
    summary: '资料变更同步到文章、评论、ES 三处。事务提交后再发消息、消费端幂等、broker 注册错 IP 的坑。',
    content: A5,
    categoryId: 2,
    categoryName: '中间件',
    tags: ['RocketMQ', '事件驱动'],
    cover: svgCover('#10b981', '#059669', 'RocketMQ'),
    authorName: '晓知',
    authorAvatar: svgAvatar('晓', '#6366f1', '#8b5cf6'),
    createTime: '2026-09-30 18:26:00',
    viewCount: 1543,
    likeCount: 96,
    collectCount: 58
  },
  {
    id: '6',
    title: '给博客接上 Elasticsearch：中文分词、权重与高亮',
    summary: 'LIKE %关键词% 必然全表扫描。ik 分词器配置、multi_match 权重、高亮标签，以及深分页该怎么处理。',
    content: A6,
    categoryId: 2,
    categoryName: '中间件',
    tags: ['Elasticsearch', '性能优化'],
    cover: svgCover('#8b5cf6', '#6d28d9', 'Elasticsearch'),
    authorName: '晓知',
    authorAvatar: svgAvatar('晓', '#6366f1', '#8b5cf6'),
    createTime: '2026-09-24 21:55:00',
    viewCount: 2088,
    likeCount: 133,
    collectCount: 81
  },
  {
    id: '7',
    title: 'Seata AT 模式：分布式事务真的那么重吗',
    summary: '发布文章这条链路确实需要强一致。AT 模式两阶段怎么走、代价在哪、什么场景不该上。',
    content: A7,
    categoryId: 3,
    categoryName: '数据库',
    tags: ['Seata', '分布式事务'],
    cover: svgCover('#0f766e', '#134e4a', 'Seata AT'),
    authorName: '晓知',
    authorAvatar: svgAvatar('晓', '#6366f1', '#8b5cf6'),
    createTime: '2026-09-18 20:07:00',
    viewCount: 1268,
    likeCount: 78,
    collectCount: 46
  },
  {
    id: '8',
    title: '通义千问接入实践：AI 在写作流程里该做什么、不该做什么',
    summary: '别让模型润色整篇文章。起标题、写摘要、选区改写才是真正省时间的三个点，附流式接口写法。',
    content: A8,
    categoryId: 5,
    categoryName: '效率工具',
    tags: ['AI', 'Spring AI'],
    cover: svgCover('#db2777', '#7c3aed', 'AI Writing'),
    authorName: '晓知',
    authorAvatar: svgAvatar('晓', '#6366f1', '#8b5cf6'),
    createTime: '2026-09-11 22:31:00',
    viewCount: 3472,
    likeCount: 241,
    collectCount: 168
  }
]

export const articles = rawArticles.map(a => ({
  id: a.id,
  title: a.title,
  summary: a.summary,
  content: a.content,
  coverImage: a.cover,
  categoryId: a.categoryId,
  categoryName: a.categoryName,
  tags: a.tags,
  authorId: DEMO_USER_ID,
  createBy: DEMO_USER_ID,
  authorName: a.authorName,
  authorAvatar: a.authorAvatar,
  createTime: a.createTime,
  updateTime: a.createTime,
  viewCount: a.viewCount,
  likeCount: a.likeCount,
  collectCount: a.collectCount,
  favoriteCount: a.collectCount,
  status: 1,
  isTop: Number(a.id) === 1 ? 1 : 0
}))

export const favoriteArticles = [articles[3], articles[2], articles[7]]

/* ---------- 评论 ---------- */

export const comments = [
  {
    id: '101',
    blogId: '1',
    userId: '2',
    nickname: '阿澈',
    avatarUrl: svgAvatar('澈', '#0ea5e9', '#22d3ee'),
    content: '边界那段说到点上了。我们组就是拆完之后每个需求还是改五个服务，最后又合并回去了。',
    createTime: '2026-10-29 09:32:00',
    likeCount: 24,
    status: 1,
    children: [
      {
        id: '102',
        blogId: '1',
        parentId: '101',
        rootId: '101',
        userId: DEMO_USER_ID,
        nickname: '晓知',
        avatarUrl: svgAvatar('晓', '#6366f1', '#8b5cf6'),
        content: '对，判断标准应该是「一次需求平均改几个服务」，超过两个就说明边界有问题。',
        createTime: '2026-10-29 10:05:00',
        likeCount: 15,
        status: 1
      },
      {
        id: '103',
        blogId: '1',
        parentId: '101',
        rootId: '101',
        userId: '3',
        nickname: '林深',
        avatarUrl: svgAvatar('林', '#f59e0b', '#f97316'),
        content: '我们也是，最后只留下了网关和检索两个，其他都合回去了。',
        createTime: '2026-10-29 11:41:00',
        likeCount: 8,
        status: 1
      }
    ]
  },
  {
    id: '104',
    blogId: '1',
    userId: '4',
    nickname: '半糖',
    avatarUrl: svgAvatar('糖', '#ec4899', '#f43f5e'),
    content: 'SERVER__PORT 那个坑我也踩过，找了整整一晚上，最后是打印全部环境变量才发现的。',
    createTime: '2026-10-28 23:12:00',
    likeCount: 37,
    status: 1,
    children: [
      {
        id: '105',
        blogId: '1',
        parentId: '104',
        rootId: '104',
        userId: DEMO_USER_ID,
        nickname: '晓知',
        avatarUrl: svgAvatar('晓', '#6366f1', '#8b5cf6'),
        content: 'Spring Boot 的宽松绑定太容易变成幽灵 bug 了，建议本地启动脚本里显式清掉。',
        createTime: '2026-10-28 23:30:00',
        likeCount: 11,
        status: 1
      }
    ]
  },
  {
    id: '106',
    blogId: '1',
    userId: '5',
    nickname: 'Kevin',
    avatarUrl: svgAvatar('K', '#14b8a6', '#0d9488'),
    content: '想请教一下 common 包是怎么管理的？发布到私服还是直接本地 install？',
    createTime: '2026-10-28 21:50:00',
    likeCount: 6,
    status: 1,
    children: []
  }
]

/* ---------- 用户列表（管理后台） ---------- */

export const users = [
  {
    id: '1', username: 'admin', nickname: '晓知',
    avatarUrl: svgAvatar('晓', '#6366f1', '#8b5cf6'),
    email: 'admin@iblog.dev', gender: '男', roleId: 1, status: 0,
    blogCount: 8, motto: '把每一次踩坑都写成文档', createTime: '2025-03-18 10:24:00'
  },
  {
    id: '2', username: 'ache', nickname: '阿澈',
    avatarUrl: svgAvatar('澈', '#0ea5e9', '#22d3ee'),
    email: 'ache@example.com', gender: '男', roleId: 2, status: 0,
    blogCount: 5, motto: '写代码，也写诗', createTime: '2025-06-02 14:08:00'
  },
  {
    id: '3', username: 'linshen', nickname: '林深',
    avatarUrl: svgAvatar('林', '#f59e0b', '#f97316'),
    email: 'linshen@example.com', gender: '女', roleId: 2, status: 0,
    blogCount: 12, motto: '慢慢来，比较快', createTime: '2025-07-19 09:36:00'
  },
  {
    id: '4', username: 'bantang', nickname: '半糖',
    avatarUrl: svgAvatar('糖', '#ec4899', '#f43f5e'),
    email: 'bantang@example.com', gender: '女', roleId: 2, status: 0,
    blogCount: 3, motto: '一半糖，一半代码', createTime: '2025-11-05 20:12:00'
  },
  {
    id: '5', username: 'kevin', nickname: 'Kevin',
    avatarUrl: svgAvatar('K', '#14b8a6', '#0d9488'),
    email: 'kevin@example.com', gender: '男', roleId: 2, status: 1,
    blogCount: 0, motto: '', createTime: '2026-01-22 11:45:00'
  }
]
