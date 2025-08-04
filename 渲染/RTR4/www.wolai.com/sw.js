var D = Object.defineProperty;
var U = (t, e, n) => e in t ? D(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var I = (t, e, n) => (U(t, typeof e != "symbol" ? e + "" : e, n), n), R = (t, e, n) => {
  if (!e.has(t))
    throw TypeError("Cannot " + n);
};
var w = (t, e, n) => (R(t, e, "read from private field"), n ? n.call(t) : e.get(t)), g = (t, e, n) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, n);
}, d = (t, e, n, o) => (R(t, e, "write to private field"), o ? o.call(t, n) : e.set(t, n), n);
var E = (t, e, n, o) => ({
  set _(a) {
    d(t, e, a, n);
  },
  get _() {
    return w(t, e, o);
  }
});
const j = async (t) => {
  try {
    (await self.clients.matchAll({ includeUncontrolled: !0, type: "window" })).forEach((n) => n.postMessage(t));
  } catch (e) {
    console.error("broadcast error: ", e);
  }
}, A = () => caches.open("wolai-cache"), M = () => caches.open("wolai-meta"), O = () => caches.delete("wolai-cache"), V = () => caches.delete("wolai-meta"), v = async (t) => {
  const e = await M(), n = await e.match(t);
  if (n) {
    const o = await n.text();
    return JSON.parse(o);
  } else
    return null;
}, C = async (t, e) => {
  const n = await M();
  try {
    return await n.put(t, new Response(JSON.stringify(e), { headers: { "content-type": "text/plain" } })), !0;
  } catch (o) {
    return console.error("setMetaItem error " + o), !1;
  }
}, T = async (t, e) => {
  const n = await v(t), o = await e(n);
  return await C(t, o) ? o : null;
};
let p = null;
const H = (t) => p = t, W = () => (p && p.expiresAt < Date.now() && (p = null), p), b = async (t, e) => {
  const n = W();
  if (n) {
    const o = n.origin + "/?url=" + (t instanceof Request ? t.url : t instanceof URL ? t.href : t);
    try {
      return await fetch(o, e);
    } catch {
      console.log("get content from native server failed, try grab from remote server");
    }
  }
  return await fetch(t, e);
};
class Y {
  constructor(e) {
    I(this, "value");
    I(this, "next");
    this.value = e;
  }
}
var l, f, h;
class $ {
  constructor() {
    g(this, l, void 0);
    g(this, f, void 0);
    g(this, h, void 0);
    this.clear();
  }
  enqueue(e) {
    const n = new Y(e);
    w(this, l) ? (w(this, f).next = n, d(this, f, n)) : (d(this, l, n), d(this, f, n)), E(this, h)._++;
  }
  dequeue() {
    const e = w(this, l);
    if (e)
      return d(this, l, w(this, l).next), E(this, h)._--, e.value;
  }
  peek() {
    if (w(this, l))
      return w(this, l).value;
  }
  clear() {
    d(this, l, void 0), d(this, f, void 0), d(this, h, 0);
  }
  get size() {
    return w(this, h);
  }
  *[Symbol.iterator]() {
    let e = w(this, l);
    for (; e; )
      yield e.value, e = e.next;
  }
}
l = new WeakMap(), f = new WeakMap(), h = new WeakMap();
const J = {
  bind(t, e, n) {
    return t.bind(n);
  }
};
function Q(t) {
  if (!((Number.isInteger(t) || t === Number.POSITIVE_INFINITY) && t > 0))
    throw new TypeError("Expected `concurrency` to be a number from 1 and up");
  const e = new $();
  let n = 0;
  const o = () => {
    n--, e.size > 0 && e.dequeue()();
  }, a = async (u, i, s) => {
    n++;
    const x = (async () => u(...s))();
    i(x);
    try {
      await x;
    } catch {
    }
    o();
  }, c = (u, i, s) => {
    e.enqueue(
      J.bind(a.bind(void 0, u, i, s))
    ), (async () => (await Promise.resolve(), n < t && e.size > 0 && e.dequeue()()))();
  }, r = (u, ...i) => new Promise((s) => {
    c(u, s, i);
  });
  return Object.defineProperties(r, {
    activeCount: {
      get: () => n
    },
    pendingCount: {
      get: () => e.size
    },
    clearQueue: {
      value() {
        e.clear();
      }
    }
  }), r;
}
const Z = async (t) => {
  try {
    const e = await b(t, { cache: "no-cache", redirect: "error" });
    return e.ok ? await e.json() : null;
  } catch (e) {
    return console.log("❌ 获取远端 manifest 失败 " + e), null;
  }
}, q = async (t) => {
  try {
    const e = await v("cached-versions") || [], n = e.find((o) => t ? o.version === t : o.active) || null;
    return n ? n.manifest : null;
  } catch (e) {
    return console.log("❌ 获取本地 manifest 失败 " + e), null;
  }
}, B = async () => {
  const t = await q();
  if (t) {
    const e = t.files.find((n) => /index\.[^.]+\.html/.test(n.path));
    if (e)
      return e.path;
  }
  return null;
}, N = async (t) => {
  const e = await A(), n = Q(12);
  let o = !0;
  const a = t.map((c) => n(async () => {
    const r = c.path;
    if (!await e.match(r))
      try {
        const i = await b(r);
        if (i.ok)
          e.put(r, i);
        else
          throw new Error("❌ 加载文件失败 " + r);
      } catch (i) {
        console.error("❌ 缓存失败 " + i + " " + r), o = !1;
      }
  }));
  return await Promise.all(a), o;
}, F = async (t) => {
  const e = await v("cached-versions") || [], n = e.slice().reverse().find((c) => c.version === t);
  if (!n)
    return console.error("❌ 目标版本未完整缓存 " + t), !1;
  if (n.active)
    return console.log("当前版本已经是 active 状态，不需要切换 " + t), !0;
  const o = e.map((c) => ({ ...c, active: !1 })), a = o.slice().reverse().find((c) => c.version === t);
  return a && (a.active = !0), await C("cached-versions", o);
}, P = async () => {
  const t = await v("cached-versions") || [], e = t.findIndex((s) => s.active);
  if (e === -1)
    return !0;
  const n = t.slice(Math.max(e - 1, 0));
  if (!await C("cached-versions", n))
    return console.log("❌ 清理 versions 失败，等待下次清理"), !1;
  const a = n.reduce((s, x) => x.manifest.files.reduce((L, z) => (L[z.path] = 1, L), s), {}), c = await A(), r = await c.keys(), u = await Promise.all(r.map((s) => a[s.url] ? !0 : c.delete(s))), i = u.every((s) => s);
  try {
    const s = await caches.keys();
    await Promise.all(s.filter((x) => x.startsWith("pwa")).map((x) => caches.delete(x)));
  } catch (s) {
    console.log("移除老版本的 sw 缓存文件失败", s);
  }
  return i ? console.log("🧹 清理过时缓存成功") : console.error("❌ 清理过时缓存失败"), i;
}, G = async () => {
  try {
    await Promise.all([V(), O()]), console.error("📛 清空所有的缓存成功");
  } catch (t) {
    console.error("❌ 清空所有的缓存失败", t);
  }
}, K = async (t) => {
  if (t.forceClean) {
    console.log("🚜 开始强制清空缓存, 保留版本 " + t.version + " " + t.date);
    const e = await v("cached-versions") || [], n = e.find((o) => o.manifest.date === t.date && o.manifest.version === t.version);
    n ? (await C("cached-versions", [{ ...n, active: !0 }]), await P()) : (console.log("📛 清空所有的缓存"), await G());
  }
}, X = async (t) => {
  console.log("🔄 开始获取远端 manifest");
  const e = await Z(t);
  if (!e)
    return console.error("❌ 获取远端 manifest 失败"), !1;
  e.forceClean && await K(e), console.log("💡 获取远端 manifest 成功, version: " + e.version);
  const n = await q();
  if (!n || n.date !== e.date) {
    const o = new Date(e.date || 0).toLocaleString();
    console.log("🌀 有新版本，开始更新缓存 " + e.version + " " + o);
    const a = await N(e.files);
    if (!a)
      return console.error("❌ 装载远端文件到本地缓存失败"), !1;
    console.log("💯 新版本缓存成功 " + e.version), a && await T("cached-versions", (r) => (r || []).concat({ version: e.version, date: e.date, manifest: e, active: !1 })), await F(e.version) ? console.log("🚀 切换新版本成功 " + e.version + " " + o) : console.error("❌ 切换新版本失败 " + e.version), await P();
  } else {
    await N(n.files);
    const o = new Date(n.date || 0).toLocaleString();
    console.log("✨ 当前为最新版本的缓存 " + e.version + " " + o);
  }
  return !0;
};
let y = !1;
const S = async (t) => {
  if (y) {
    console.log("🕛 已经有更新缓存任务在运行中");
    return;
  }
  try {
    y = !0;
    const e = await X(t);
    return !e && console.error("❌ 更新缓存失败"), y = !1, e;
  } catch (e) {
    return console.error("❌ 更新缓存失败", e), y = !1, !1;
  }
};
function m(t, e) {
  try {
    return e.some((n) => typeof n == "string" ? n === t : n.test(t));
  } catch (n) {
    return console.error("💀 匹配规则失败", n), !1;
  }
}
const k = location.origin + "/manifest.json", ee = (t) => {
  const { host: e, protocol: n, pathname: o } = new URL(t), a = ["http:", "https:"], c = ["wolai.com", "www.wolai.com", "pre.wolai.com", "www1.wolai.com", "www2.wolai.com", "www3.wolai.com", "www-uat.wolai.com", "previous.wolai.com", "www-test.wolai.com", "www-test1.wolai.com", "www-test2.wolai.com", "www-test3.wolai.com", "www-test4.wolai.com", "www-test5.wolai.com", "www-test-mobile.wolai.com", "pre-workspace.dingtalk.com", "pre-test-workspace.dingtalk.com", "pre-test1-workspace.dingtalk.com", "pre-test2-workspace.dingtalk.com", "pre-test3-workspace.dingtalk.com", "pre-test4-workspace.dingtalk.com", "pre-test5-workspace.dingtalk.com", "workspace.dingtalk.com"], r = ["/", "/day", "/dev", "/downloads", "/email_activate", "/enter", "/first", "/invitation", "/invitationLanding", "/login", "/logout", "/messages", "/nav", "/new-form", "/new", "/pricing", "/product", "/random", "/reset_password", "/signOutFinish", "/signup", /^\/bu\//, /^\/component\//, /^\/invitation\//, /^\/public-invitation\//, /^\/wolai_poster\//, /^\/wolai_share\//, /^\/[0-9A-Za-z]{16,32}\/?$/, /^\/(([a-z]{1}[a-z0-9_-]{3,14})|(333))\/[0-9A-Za-z]{16,32}\/?$/];
  return !!(m(n, a) && m(e, c) && m(o, r));
}, te = (t) => {
  const { host: e, protocol: n, pathname: o } = new URL(t), a = ["http:", "https:"], c = ["vcdn.wostatic.cn", "cdn.wostatic.cn", "static-test.wolai.com", "cdn.wol-static.com", "dev.g.alicdn.com", "g.alicdn.com"], r = [/\.(eot|ttf|woff|woff2|css|js|json)$/i];
  return !!(m(n, a) && m(e, c) && m(o, r));
}, ne = !1, _ = async (t) => {
  const e = await A(), n = await e.match(t);
  if (n != null && n.ok)
    return n;
  const o = await b(t);
  return o != null && o.ok && e.put(t, o.clone()), o;
}, oe = async (t) => {
  const e = await B();
  return _(e || t);
};
self.addEventListener("fetch", (t) => {
  const e = t.request, n = e.url;
  try {
    const { searchParams: o } = new URL(n);
    if (o.get("sw-bypass"))
      return;
    if (te(n))
      return t.respondWith(_(t.request));
    if (!ne && ee(n))
      return setTimeout(() => S(k), 10 * 1e3), t.respondWith(oe(t.request));
  } catch (o) {
    console.error("💀 请求处理失败", o);
  }
}), self.addEventListener("install", (t) => {
  t.waitUntil(self.skipWaiting());
}), self.addEventListener("activate", (t) => {
  console.log("🥳 新 sw 激活成功"), setTimeout(() => S(k), 10 * 1e3), t.waitUntil(self.clients.claim());
});
const ae = async (t) => {
  H(t);
  const e = await b(k), n = await e.json();
  await T("cached-versions", (o) => (o || []).concat({ version: n.version, date: n.date, manifest: n, active: !1 })), await F(n.version), j({ type: "NATIVE_CACHED" }), console.log("🎉 成功激活 native 版本 " + n.version);
};
self.addEventListener("message", async (t) => {
  const e = t.data;
  try {
    switch (e.type) {
      case "SERVER_INFO":
        await ae(e.body);
        break;
      default:
        console.log("未处理的 sw 消息类型 " + e.type);
        break;
    }
  } catch (n) {
    console.error("💀 sw 消息处理失败", n);
  }
}), setInterval(() => S(k), 1e3 * 60 * 10);
