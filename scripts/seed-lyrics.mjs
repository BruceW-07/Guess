import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUTPUT_FILE = path.resolve("data/seed/lyrics.json");

const TARGET_COUNT = 130;

// Search/fetch flow mirrors the NetEase endpoints used by:
// vendor/163MusicLyrics/cross-platform/MusicLyricApp/Core/Service/Music/NetEaseMusicApi.cs
const SONGS = [
  ["童话", "光良"],
  ["勇气", "梁静茹"],
  ["倒带", "蔡依林"],
  ["小情歌", "苏打绿"],
  ["无与伦比的美丽", "苏打绿"],
  ["我好想你", "苏打绿"],
  ["十年一刻", "苏打绿"],
  ["你在烦恼什么", "苏打绿"],
  ["当我们一起走过", "苏打绿"],
  ["香格里拉", "魏如萱"],
  ["你啊你啊", "魏如萱"],
  ["还是要相信爱情啊混蛋们", "魏如萱"],
  ["彼个所在", "魏如萱"],
  ["买你", "魏如萱"],
  ["晚安晚安", "魏如萱"],
  ["门", "魏如萱"],
  ["宝贝", "张悬"],
  ["关于我爱你", "张悬"],
  ["喜欢", "张悬"],
  ["儿歌", "张悬"],
  ["城市", "张悬"],
  ["南国的孩子", "张悬"],
  ["艳火", "张悬"],
  ["情歌", "陈珊妮"],
  ["如果有一件事是重要的", "陈珊妮"],
  ["雨天", "陈珊妮"],
  ["青春骊歌", "陈珊妮"],
  ["完美落地", "陈珊妮"],
  ["旅行的意义", "陈绮贞"],
  ["还是会寂寞", "陈绮贞"],
  ["太聪明", "陈绮贞"],
  ["告诉我", "陈绮贞"],
  ["九份的咖啡店", "陈绮贞"],
  ["鱼", "陈绮贞"],
  ["华丽的冒险", "陈绮贞"],
  ["突然好想你", "五月天"],
  ["夜曲", "周杰伦"],
  ["夜空中最亮的星", "逃跑计划"],
  ["修炼爱情", "林俊杰"],
  ["江南", "林俊杰"],
  ["小幸运", "田馥甄"],
  ["泡沫", "邓紫棋"],
  ["后来", "刘若英"],
  ["知足", "五月天"],
  ["倔强", "五月天"],
  ["平凡之路", "朴树"],
  ["成都", "赵雷"],
  ["演员", "薛之谦"],
  ["光年之外", "邓紫棋"],
  ["认真的雪", "薛之谦"],
  ["丑八怪", "薛之谦"],
  ["追光者", "岑宁儿"],
  ["岁月神偷", "金玟岐"],
  ["匆匆那年", "王菲"],
  ["这世界那么多人", "莫文蔚"],
  ["我怀念的", "孙燕姿"],
  ["可惜不是你", "梁静茹"],
  ["红豆", "王菲"],
  ["后会无期", "邓紫棋"],
  ["消愁", "毛不易"],
  ["南山南", "马頔"],
  ["同桌的你", "老狼"],
  ["遇见", "孙燕姿"],
  ["画", "邓紫棋"],
  ["如果有来生", "谭维维"],
  ["传奇", "王菲"],
  ["温柔", "五月天"],
  ["晴天", "周杰伦"],
  ["告白气球", "周杰伦"],
  ["稻香", "周杰伦"],
  ["青花瓷", "周杰伦"],
  ["七里香", "周杰伦"],
  ["简单爱", "周杰伦"],
  ["安静", "周杰伦"],
  ["一路向北", "周杰伦"],
  ["搁浅", "周杰伦"],
  ["最长的电影", "周杰伦"],
  ["珊瑚海", "周杰伦"],
  ["彩虹", "周杰伦"],
  ["轨迹", "周杰伦"],
  ["不能说的秘密", "周杰伦"],
  ["算什么男人", "周杰伦"],
  ["说好的幸福呢", "周杰伦"],
  ["蒲公英的约定", "周杰伦"],
  ["发如雪", "周杰伦"],
  ["东风破", "周杰伦"],
  ["给我一首歌的时间", "周杰伦"],
  ["花海", "周杰伦"],
  ["我不配", "周杰伦"],
  ["退后", "周杰伦"],
  ["说爱你", "蔡依林"],
  ["日不落", "蔡依林"],
  ["布拉格广场", "蔡依林"],
  ["柠檬草的味道", "蔡依林"],
  ["爱情三十六计", "蔡依林"],
  ["如果你也听说", "张惠妹"],
  ["听海", "张惠妹"],
  ["记得", "张惠妹"],
  ["趁早", "张惠妹"],
  ["我最亲爱的", "张惠妹"],
  ["遇见", "孙燕姿"],
  ["开始懂了", "孙燕姿"],
  ["我怀念的", "孙燕姿"],
  ["天黑黑", "孙燕姿"],
  ["第一天", "孙燕姿"],
  ["绿光", "孙燕姿"],
  ["爱情证书", "孙燕姿"],
  ["雨天", "孙燕姿"],
  ["宁夏", "梁静茹"],
  ["分手快乐", "梁静茹"],
  ["会呼吸的痛", "梁静茹"],
  ["可惜不是你", "梁静茹"],
  ["暖暖", "梁静茹"],
  ["崇拜", "梁静茹"],
  ["宁静夏天", "梁静茹"],
  ["问", "梁静茹"],
  ["红豆", "王菲"],
  ["匆匆那年", "王菲"],
  ["流年", "王菲"],
  ["传奇", "王菲"],
  ["因为爱情", "王菲"],
  ["我愿意", "王菲"],
  ["人间", "王菲"],
  ["容易受伤的女人", "王菲"],
  ["修炼爱情", "林俊杰"],
  ["江南", "林俊杰"],
  ["可惜没如果", "林俊杰"],
  ["她说", "林俊杰"],
  ["曹操", "林俊杰"],
  ["背对背拥抱", "林俊杰"],
  ["醉赤壁", "林俊杰"],
  ["爱笑的眼睛", "林俊杰"],
  ["关键词", "林俊杰"],
  ["交换余生", "林俊杰"],
  ["小酒窝", "林俊杰"],
  ["可惜没如果", "林俊杰"],
  ["夜空中最亮的星", "逃跑计划"],
  ["追梦赤子心", "GALA"],
  ["蓝莲花", "许巍"],
  ["曾经的你", "许巍"],
  ["旅行", "许巍"],
  ["故乡", "许巍"],
  ["平凡之路", "朴树"],
  ["那些花儿", "朴树"],
  ["生如夏花", "朴树"],
  ["白桦林", "朴树"],
  ["同桌的你", "老狼"],
  ["恋曲1990", "罗大佑"],
  ["光阴的故事", "罗大佑"],
  ["童年", "罗大佑"],
  ["后来", "刘若英"],
  ["很爱很爱你", "刘若英"],
  ["为爱痴狂", "刘若英"],
  ["当爱在靠近", "刘若英"],
  ["成全", "刘若英"],
  ["成都", "赵雷"],
  ["南方姑娘", "赵雷"],
  ["画", "赵雷"],
  ["我记得", "赵雷"],
  ["南山南", "马頔"],
  ["消愁", "毛不易"],
  ["像我这样的人", "毛不易"],
  ["一程山路", "毛不易"],
  ["平凡的一天", "毛不易"],
  ["借", "毛不易"],
  ["泡沫", "邓紫棋"],
  ["光年之外", "邓紫棋"],
  ["倒数", "邓紫棋"],
  ["多远都要在一起", "邓紫棋"],
  ["来自天堂的魔鬼", "邓紫棋"],
  ["句号", "邓紫棋"],
  ["后会无期", "邓紫棋"],
  ["演员", "薛之谦"],
  ["认真的雪", "薛之谦"],
  ["丑八怪", "薛之谦"],
  ["绅士", "薛之谦"],
  ["刚刚好", "薛之谦"],
  ["你还要我怎样", "薛之谦"],
  ["天外来物", "薛之谦"],
  ["有没有", "薛之谦"],
  ["刚好遇见你", "李玉刚"],
  ["年轮", "张碧晨"],
  ["凉凉", "张碧晨"],
  ["体面", "于文文"],
  ["后来的我们", "五月天"],
  ["知足", "五月天"],
  ["倔强", "五月天"],
  ["温柔", "五月天"],
  ["突然好想你", "五月天"],
  ["恋爱ing", "五月天"],
  ["后青春期的诗", "五月天"],
  ["如果我们不曾相遇", "五月天"],
  ["你不是真正的快乐", "五月天"],
  ["笑忘歌", "五月天"],
  ["这世界那么多人", "莫文蔚"],
  ["慢慢喜欢你", "莫文蔚"],
  ["阴天", "莫文蔚"],
  ["广岛之恋", "莫文蔚"],
  ["盛夏的果实", "莫文蔚"],
  ["追光者", "岑宁儿"],
  ["起风了", "买辣椒也用券"],
  ["世界末日", "周杰伦"],
  ["海阔天空", "Beyond"],
  ["光辉岁月", "Beyond"],
  ["喜欢你", "Beyond"],
  ["真的爱你", "Beyond"]
];

const SEARCH_HEADERS = {
  referer: "https://music.163.com/",
  "user-agent": "Mozilla/5.0",
};

const TIMESTAMP_RE = /\[\d{2,}:\d{2}(?:\.\d{1,3})?\]/g;

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[·.。,【】()（）\-_/'"\s,!！?？:：]/g, "");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  let lastError = null;

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await fetch(url, { headers: SEARCH_HEADERS });
      const text = await response.text();
      const payload = JSON.parse(text);

      if (payload.result || payload.lrc) {
        if (attempt > 1) {
          console.log(`recovered after retry ${attempt}: ${url}`);
        }
        return payload;
      }

      lastError = new Error(payload.message || payload.msg || "unexpected response");
    } catch (error) {
      lastError = error;
    }

    await sleep(attempt * 1200);
  }

  throw lastError ?? new Error("request failed");
}

function isMetadataLine(line) {
  return /^(作词|作曲|编曲|制作人|制作统筹|和声|和音|和声\/和声编写|吉他|低音吉他|贝斯|鼓|钢琴|录音|混音|母带|录音助理|录音工程师|混音工程师|混音助理|录音室|混音室|统筹|企划|营销|出品|发行|监制|封面|配唱|弦乐|Program|OP|SP|Recording|Mixing|Musicians|Background Vocal|Background Vocals|Guitars?|Bass|Drum|Studio|ISRC|Producer|Engineer)(\s|[:：]|$)/i.test(
    line,
  );
}

function isCreditLine(line) {
  return (
    /^(\[[\d:.+\-]+\]\s*)?([A-Za-z&/ .()-]+|[\u4e00-\u9fffA-Za-z&/ .()+-]{1,40})\s*[:：]\s*.+$/.test(line) ||
    /^[\u4e00-\u9fffA-Za-z&/@ .()+-]{1,40}\d?\s*[:：]\s*.+$/.test(line) ||
    /^(Engineered|Mixed|Recorded|Produced|Arranged|Special Thanks|Orchestra Recorded)\b/i.test(line)
  );
}

function isStructuralNoise(line) {
  return /^(纯音乐，请欣赏|\((主歌|副歌|间奏)\)|（(主歌|副歌|间奏)）)$/i.test(line);
}

function isNoiseLine(line, title, author) {
  const normalizedLine = normalize(line);
  const titleVariants = new Set([
    normalize(title),
    normalize(author),
    normalize(`${title}-${author}`),
    normalize(`${author}-${title}`),
    normalize(`${title}${author}`),
    normalize(`${author}${title}`),
  ]);

  return (
    !line ||
    /^[:：]+$/.test(line) ||
    isMetadataLine(line) ||
    isCreditLine(line) ||
    isStructuralNoise(line) ||
    /^(伴奏|纯音乐|inst\.?|instrumental)$/i.test(line) ||
    /(cover|demo|remix|dj|live|版)$/i.test(line) ||
    /^\[[\d:.+\-]+\]\s*/.test(line) ||
    titleVariants.has(normalizedLine)
  );
}

function compactParagraphs(lines) {
  const paragraphs = [];
  let current = [];

  for (const line of lines) {
    if (!line) {
      if (current.length > 0) {
        paragraphs.push(current);
        current = [];
      }
      continue;
    }

    current.push(line);

    if (current.length >= 4) {
      paragraphs.push(current);
      current = [];
    }
  }

  if (current.length > 0) {
    paragraphs.push(current);
  }

  return paragraphs;
}

function splitMergedLine(line) {
  if (
    !/[\u4e00-\u9fff]/.test(line) ||
    !/\s/.test(line) ||
    /[:：/()（）]/.test(line) ||
    /[A-Za-z]/.test(line)
  ) {
    return [line];
  }

  return line
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseLyric(rawLyric, title, author) {
  const cleaned = rawLyric
    .split("\n")
    .map((line) => line.replace(TIMESTAMP_RE, "").trim());

  while (
    cleaned.length > 0 &&
    isNoiseLine(cleaned[0], title, author)
  ) {
    cleaned.shift();
  }

  while (cleaned.length > 0 && isNoiseLine(cleaned.at(-1), title, author)) {
    cleaned.pop();
  }

  const normalized = [];
  let blankRun = 0;

  for (const line of cleaned) {
    if (!line) {
      blankRun += 1;
      if (blankRun === 1) {
        normalized.push("");
      }
      continue;
    }

    if (isNoiseLine(line, title, author)) {
      continue;
    }

    blankRun = 0;
    for (const part of splitMergedLine(line)) {
      if (!isNoiseLine(part, title, author)) {
        normalized.push(part);
      }
    }
  }

  return compactParagraphs(normalized).filter((group) => group.length > 0);
}

async function searchSong(title, author) {
  const query = encodeURIComponent(`${title} ${author}`);
  const url = `https://music.163.com/api/search/get/web?type=1&s=${query}&limit=10&offset=0`;
  const payload = await fetchJson(url);
  const songs = payload.result?.songs ?? [];
  const normalizedTitle = normalize(title);
  const normalizedAuthor = normalize(author);

  return (
    songs.find((song) => {
      const songTitle = normalize(song.name);
      return (
        songTitle === normalizedTitle &&
        song.artists?.some((artist) => {
          const artistName = normalize(artist.name);
          return artistName.includes(normalizedAuthor) || normalizedAuthor.includes(artistName);
        })
      );
    }) ??
    songs.find((song) => normalize(song.name).includes(normalizedTitle)) ??
    null
  );
}

async function fetchLyric(songId) {
  const url = `https://music.163.com/api/song/lyric?id=${songId}&lv=-1&kv=-1&tv=-1`;
  const payload = await fetchJson(url);
  return payload.lrc?.lyric ?? "";
}

async function readExistingEntries() {
  try {
    const raw = await readFile(OUTPUT_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function main() {
  const previousEntries = await readExistingEntries();
  if (previousEntries.length > 0) {
    console.log(`rebuilding ${OUTPUT_FILE}; previous entries: ${previousEntries.length}`);
  }

  const entries = [];
  const existingTitles = new Set();

  for (const [title, author] of SONGS) {
    if (entries.length >= TARGET_COUNT) {
      break;
    }

    const key = `${title}::${author}`;
    if (existingTitles.has(key)) {
      continue;
    }

    try {
      const song = await searchSong(title, author);
      if (!song) {
        console.warn(`skip ${title} - ${author}: no search result`);
        continue;
      }

      const rawLyric = await fetchLyric(song.id);
      const paragraphs = parseLyric(rawLyric, title, author);

      if (paragraphs.length === 0) {
        console.warn(`skip ${title} - ${author}: empty lyric`);
        continue;
      }

      entries.push({
        id: `lyric-${entries.length + 1}`,
        title,
        author,
        paragraphs,
      });
      existingTitles.add(key);

      console.log(`fetched ${title} - ${author} (${song.id})`);
      await sleep(700);
    } catch (error) {
      console.warn(`skip ${title} - ${author}: ${error instanceof Error ? error.message : String(error)}`);
      await sleep(1200);
    }
  }

  if (entries.length < TARGET_COUNT) {
    throw new Error(`only fetched ${entries.length} entries, expected at least ${TARGET_COUNT}`);
  }

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
  console.log(`wrote ${entries.length} entries to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
