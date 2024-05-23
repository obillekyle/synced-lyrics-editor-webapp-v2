const tagTooltips: Record<string, string | undefined> = {
  ar: 'Artist',
  au: 'Author',
  al: 'Album',
  by: 'Composer',
  ti: 'Title',
  offset: 'Offset',
  ref: 'Reference',
  rel: 'Release',
  re: 'Source',
  total: 'Total',
  w: 'Website',
  c: 'Copyright',
  g: 'Genre',
  m: 'Musician',
  v: 'Version',
  $id: 'ID',
};

function formatTag(tag: string) {
  const tagMatch = tag.match(/\[(.*)\:(.*)\](.*)/);
  if (!tagMatch) return tag;

  const tooltip = tagTooltips[tagMatch[1]] || '';

  let value = '';

  value += '<span class="tag">';
  value += '<span class="bracket">[</span>';
  value += '<span class="key" tip="' + tooltip + '">' + tagMatch[1] + '</span>';
  value += '<span class="separator">:</span>';
  value += '<span class="value">' + tagMatch[2] + '</span>';
  value += '<span class="bracket">]</span>';
  value +=
    '<span class="invalid" tip="\'' +
    tagMatch[3] +
    "' is ignored" +
    '">' +
    tagMatch[3] +
    '</span>';
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
  return `<span>${text || '<br/>'}</span>`;
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
  return value;
}

export function jsonTextFormatter(data: string): string {
  let value = '';
  let depth = 0;

  for (let i = 0; i < data.length; i++) {
    const char = data[i];

    switch (char) {
      case '{':
      case '[':
        depth++;
        value += '<span class="bracket">' + char + '</span>';
        if (i < data.length - 1 && data[i + 1] !== '\n') value += ' ';
        break;
      case '}':
      case ']':
        depth--;
        if (i > 0 && data[i - 1] !== '\n') value += ' ';
        value += '<span class="bracket">' + char + '</span>';
        break;
      case ',':
        value += '<span class="comma">' + char + '</span>';
        if (i < data.length - 1 && data[i + 1] !== '\n') value += ' ';
        break;
      case ':':
        value += '<span class="colon">' + char + '</span>';
        if (i < data.length - 1 && data[i + 1] !== '\n') value += ' ';
        break;
      case '"':
        value += '<span class="string">' + char;
        let end = data.indexOf('"', i + 1);
        while (end > 0 && data[end - 1] === '\\') {
          end = data.indexOf('"', end + 1);
        }
        value += data.substring(i + 1, end) + '</span>';
        i = end;
        break;
      default:
        value += char;
        break;
    }
  }

  return `<span class="json">${value}</span>`;
}
