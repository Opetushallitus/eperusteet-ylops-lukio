export function unwrap(el: HTMLElement | null) {
  if (!el || !el.parentNode) {
    return;
  }

  while (el.firstChild) {
    el.parentNode.insertBefore(el.removeChild(el.firstChild), el);
  }
  el.parentNode.removeChild(el);
}


export function findIndexWithTagsIncluded(innerHtml: string, targetIdx: number) {
  if (targetIdx < 0) {
    return -1;
  }

  let idx = 0;
  let tagAmount = 0;
  let depth = 0;
  let lastIndent = -1;

  while (idx < innerHtml.length) {
    if (innerHtml[idx] === '<') {
      ++depth;
      lastIndent = idx;
    }

    if (depth > 0) {
      ++tagAmount;
    }

    if (innerHtml[idx] === '>') {
      --depth;

    }

    const ch = innerHtml[idx];
    if (idx - tagAmount >= targetIdx) {
      return idx;
    }

    ++idx;
  }

  if (lastIndent > -1 && depth === 0) {
    return lastIndent;
  }

  return -1;
}
