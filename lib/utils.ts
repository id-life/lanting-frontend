import { parse } from 'querystring';

const reg =
  /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const CDN_DOMAIN = process.env.NEXT_PUBLIC_CDN_DOMAIN || 'http://localhost:3000';

export const isUrl = (path: string): boolean => reg.test(path);

export const getPageQuery = () => {
  if (typeof window !== 'undefined') {
    return parse(window.location.href.split('?')[1]);
  }
  return {};
};

export const fieldToTranslation: Record<string, string> = {
  author: '作者',
  publisher: '媒体',
  date: '年月',
  tag: '标签',
};

export const toChineseNumbers = (tempNum: string | number): string => {
  let temp = String(tempNum);
  const units = ['十', '百', '千', '万', '十', '百', '千', '亿'];
  const numeric = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];

  if (temp === '0') return numeric[0]; // 处理 "0" 的情况

  let res = '';
  for (let k = -1; temp.length > 0; k++) {
    const j = +temp[temp.length - 1];
    let rtemp = numeric[j];
    if ((j !== 0 && k !== -1) || k % 8 === 3 || k % 8 === 7) {
      if (k < units.length) {
        // 确保不会超出 units 数组范围
        rtemp += units[k % 8];
      }
    }
    res = rtemp + res;
    temp = temp.substring(0, temp.length - 1);
  }
  while (res.endsWith(numeric[0]) && res.length > 1) {
    // 避免 "零" 本身被移除
    res = res.substring(0, res.lastIndexOf(numeric[0]));
  }
  while (res.includes(numeric[0] + numeric[0])) {
    res = res.replace(numeric[0] + numeric[0], numeric[0]);
  }
  for (let m = 0; m < units.length; m++) {
    // 从 units[0] 开始
    res = res.replace(numeric[0] + units[m], units[m]);
  }
  if (res.length > 1 && res.startsWith(numeric[1]) && units.includes(res[1])) {
    res = res.substring(1);
  }
  // 确保数字如 "10" 不会变成 "零"
  if (res === numeric[0] && String(tempNum) !== '0') {
    if (String(tempNum) === '10') return units[0];
  }
  return res || numeric[0]; // 如果结果为空（例如输入是 "0"），则返回 "零"
};

const shuffleInternal = (array: any[], prng?: () => number): any[] => {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor((prng ? prng() : Math.random()) * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

export const getPRNG = (seed: number): (() => number) => {
  return () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
};

export const shuffleByWeek = (array: any[]): any[] => {
  const week = 1000 * 60 * 60 * 24 * 7;
  const seed = Date.now() - (Date.now() % week);
  const rand = getPRNG(seed);
  return shuffleInternal([...array], rand); // 使用数组副本进行 shuffle
};
