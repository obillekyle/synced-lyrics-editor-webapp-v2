function formatTag(tag: string) {
  const tagMatch = tag.match(/\[(.*)\:(.*)\](.*)/);
  if (!tagMatch) return tag;

  let value = '';

  value += '<span class="tag">';
  value += '<span class="bracket">[</span>';
  value += '<span class="key">' + tagMatch[1] + '</span>';
  value += '<span class="separator">:</span>';
  value += '<span class="value">' + tagMatch[2] + '</span>';
  value += '<span class="bracket">]</span>';
  value += '<span class="invalid" title="' + tagMatch[3] + ' is ignored' + '">' + tagMatch[3] + '</span>';
  value += '</span>';


  return value;
}



function formatLine(time: string, data: string) {
  let value = '';

  value += '<span class="lrc-line">';
  value += '<span class="bracket">[</span>';
  value += '<span class="time">' + time + '</span>';
  value += '<span class="bracket">]</span>';
  value += '<span class="value">' + data + '</span>';
  value += '</span>';

  return value;
}

function formatText(text: string) {
  return `<span>${text || '<br/>'}</span>`
}

let calls = 0;
let timeout: ReturnType<typeof setTimeout> | null = null;

export function lrcTextFormatter(data: string): string {

  let value = '';

  const lines = data.split('\n');

  for (const line of lines) {
    const match = line.match(/^\[(\d{2}:\d{2}\.\d{2,3})\](.*)|^\[(.{1,}:.*)\]/);

    if (match) {
      let [, timeString, data, tag] = match;

      if (tag) value += formatTag(line);
      else value += formatLine(timeString, data);

      continue;
    }
    value += formatText(line);
  }
  return value
}
