window.__ModuleLoader__.load({
  id: '@local/json-tools',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'json-tools';
    const PANEL_ID = 'json-tools';

    // --- pure helpers: parsing, stringifying and size bookkeeping ---
    function locate(text, position) {
      if (typeof position !== 'number' || position < 0) return null;
      const before = text.slice(0, Math.min(position, text.length));
      const lines = before.split(/\r\n|\r|\n/);
      return { line: lines.length, column: lines[lines.length - 1].length + 1 };
    }

    function parseJson(raw) {
      try {
        return { ok: true, value: JSON.parse(raw) };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const match = /position\s+(\d+)/i.exec(message);
        const at = locate(raw, match === null ? -1 : Number(match[1]));
        return { ok: false, message, at };
      }
    }

    function stringifyJson(value, indent) {
      return indent === 0 ? JSON.stringify(value) : JSON.stringify(value, null, indent);
    }

    function lineCount(text) {
      if (text === '') return 0;
      let count = 1;
      for (let index = 0; index < text.length; index += 1) {
        if (text.charCodeAt(index) === 10) count += 1;
      }
      return count;
    }

    function formatCount(value) {
      return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function sizeDelta(from, to) {
      if (from <= 0) return 0;
      const percent = Math.round((Math.abs(to - from) / from) * 100);
      return to >= from ? percent : -percent;
    }
    // --- end pure helpers ---

    const zh = {
      title: 'JSON 工具',
      subtitle: '格式化或压缩 JSON 文本。粘贴、转换、复制，全部在本机完成。',
      inputLabel: '输入',
      outputLabel: '输出',
      inputPlaceholder: '在此粘贴 JSON 文本，例如 {"name":"dsh","tags":["json","tools"]}',
      outputPlaceholder: '格式化或压缩后的结果会显示在这里。',
      format: '格式化',
      minify: '压缩',
      indentLabel: '缩进',
      indent2: '2 空格',
      indent4: '4 空格',
      copy: '复制',
      copied: '已复制',
      copyFailed: '复制失败，请手动选择结果文本后复制。',
      replaceInput: '替换输入',
      clear: '清空',
      emptyHint: '先粘贴一段 JSON 文本，再点“格式化”或“压缩”。',
      done: '完成：{input} → {output} 字符（{delta}）',
      deltaUp: '+{percent}%',
      deltaDown: '−{percent}%',
      deltaSame: '0%',
      errorTitle: 'JSON 解析失败',
      errorAt: '第 {line} 行第 {column} 列',
      topObject: '顶层：对象 · {count} 个键',
      topArray: '顶层：数组 · {count} 项',
      topString: '顶层：字符串',
      topNumber: '顶层：数字',
      topBoolean: '顶层：布尔值',
      topNull: '顶层：null',
      charsLines: '{chars} 字符 · {lines} 行',
      shortcut: 'Ctrl/⌘ + Enter 格式化',
      localNote: '文本只在浏览器内处理，不会上传。',
    };

    const en = {
      title: 'JSON tools',
      subtitle: 'Format or minify JSON text. Paste, convert, copy — all on this device.',
      inputLabel: 'Input',
      outputLabel: 'Output',
      inputPlaceholder: 'Paste JSON here, for example {"name":"dsh","tags":["json","tools"]}',
      outputPlaceholder: 'The formatted or minified result appears here.',
      format: 'Format',
      minify: 'Minify',
      indentLabel: 'Indent',
      indent2: '2 spaces',
      indent4: '4 spaces',
      copy: 'Copy',
      copied: 'Copied',
      copyFailed: 'Copy failed. Select the result text and copy it manually.',
      replaceInput: 'Use as input',
      clear: 'Clear',
      emptyHint: 'Paste some JSON, then choose Format or Minify.',
      done: 'Done: {input} → {output} characters ({delta})',
      deltaUp: '+{percent}%',
      deltaDown: '−{percent}%',
      deltaSame: '0%',
      errorTitle: 'Invalid JSON',
      errorAt: 'line {line}, column {column}',
      topObject: 'Top level: object · {count} keys',
      topArray: 'Top level: array · {count} items',
      topString: 'Top level: string',
      topNumber: 'Top level: number',
      topBoolean: 'Top level: boolean',
      topNull: 'Top level: null',
      charsLines: '{chars} characters · {lines} lines',
      shortcut: 'Ctrl/⌘ + Enter to format',
      localNote: 'Text is processed in the browser only and never uploaded.',
    };

    function JsonGlyph({ size = 22 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': true,
        style: { display: 'block' },
      },
        h('path', {
          d: 'M9.3 3.5C6.9 3.5 6 5 6 6.9v2.3c0 1.7-.9 2.5-2.2 2.8 1.3.3 2.2 1.1 2.2 2.8v2.3c0 1.9.9 3.4 3.3 3.4',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M14.7 3.5c2.4 0 3.3 1.5 3.3 3.4v2.3c0 1.7.9 2.5 2.2 2.8-1.3.3-2.2 1.1-2.2 2.8v2.3c0 1.9-.9 3.4-3.3 3.4',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M13.1 8.6l-2.2 6.8',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          opacity: 0.55,
        }));
    }

    const CSS = `
.dsh-jt-root {
  height: 100%;
  overflow-y: auto;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  box-sizing: border-box;
}
.dsh-jt-root *,
.dsh-jt-root *::before,
.dsh-jt-root *::after {
  box-sizing: border-box;
}
.dsh-jt-page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 40px 28px 72px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.dsh-jt-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.dsh-jt-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.dsh-jt-mark {
  flex: none;
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l1);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent);
}
.dsh-jt-titles {
  min-width: 0;
}
.dsh-jt-titles h1 {
  margin: 0;
  font-size: 26px;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.dsh-jt-sub {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--dsw-alias-label-secondary);
}
.dsh-jt-shortcut {
  flex: none;
  align-self: center;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
}
.dsh-jt-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);
}
.dsh-jt-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.dsh-jt-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 13px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.dsh-jt-btn:hover:not(:disabled) {
  background: var(--dsw-alias-bg-layer-2);
}
.dsh-jt-btn.is-primary {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent);
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 44%, transparent);
  color: var(--dsw-alias-brand-primary);
  font-weight: 600;
}
.dsh-jt-btn.is-primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 26%, transparent);
}
.dsh-jt-spacer {
  flex: 1 1 auto;
}
.dsh-jt-seg {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border-radius: 9px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-2);
}
.dsh-jt-seg button {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 1;
  padding: 6px 9px;
  border-radius: 7px;
  cursor: pointer;
  white-space: nowrap;
}
.dsh-jt-seg button:hover {
  color: var(--dsw-alias-label-primary);
}
.dsh-jt-seg button[aria-pressed="true"] {
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 0 0 1px var(--dsw-alias-border-l1);
}
.dsh-jt-panels {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
}
.dsh-jt-panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.dsh-jt-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 20px;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary);
}
.dsh-jt-label > span:first-child {
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}
.dsh-jt-meta {
  font-variant-numeric: tabular-nums;
}
.dsh-jt-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.dsh-jt-mini {
  appearance: none;
  border: 1px solid transparent;
  background: transparent;
  color: var(--dsw-alias-brand-primary);
  font: inherit;
  font-size: 12px;
  line-height: 1;
  padding: 3px 6px;
  border-radius: 6px;
  cursor: pointer;
}
.dsh-jt-mini:hover:not(:disabled) {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent);
}
.dsh-jt-mini:disabled,
.dsh-jt-btn:disabled {
  opacity: 0.45;
  cursor: default;
}
.dsh-jt-area {
  width: 100%;
  min-height: 320px;
  resize: vertical;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  line-height: 1.65;
  tab-size: 2;
}
.dsh-jt-area.is-output {
  background: var(--dsw-alias-bg-layer-2);
}
.dsh-jt-area::placeholder {
  color: var(--dsw-alias-label-secondary);
  opacity: 0.8;
}
.dsh-jt-area:focus-visible {
  outline: none;
  border-color: var(--dsw-alias-brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, transparent);
}
.dsh-jt-status {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-height: 20px;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--dsw-alias-label-secondary);
}
.dsh-jt-status::before {
  content: '';
  flex: none;
  width: 7px;
  height: 7px;
  margin-top: 5px;
  border-radius: 50%;
  background: var(--dsw-alias-state-idle-primary);
}
.dsh-jt-status.is-ok {
  color: var(--dsw-alias-state-success-primary);
}
.dsh-jt-status.is-ok::before {
  background: var(--dsw-alias-state-success-primary);
}
.dsh-jt-status.is-error {
  color: var(--dsw-alias-state-error-primary);
}
.dsh-jt-status.is-error::before {
  background: var(--dsw-alias-state-error-primary);
}
.dsh-jt-status-text {
  min-width: 0;
}
.dsh-jt-detail {
  display: block;
  margin-top: 3px;
  color: var(--dsw-alias-label-secondary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
  word-break: break-word;
}
.dsh-jt-foot {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--dsw-alias-label-secondary);
}
.dsh-jt-root button:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}
@media (max-width: 920px) {
  .dsh-jt-page {
    padding: 26px 16px 56px;
    gap: 16px;
  }
  .dsh-jt-card {
    padding: 14px;
    border-radius: 14px;
  }
  .dsh-jt-panels {
    grid-template-columns: minmax(0, 1fr);
  }
  .dsh-jt-area {
    min-height: 220px;
  }
  .dsh-jt-titles h1 {
    font-size: 22px;
  }
  .dsh-jt-shortcut {
    align-self: flex-start;
  }
}
@media (prefers-reduced-motion: reduce) {
  .dsh-jt-btn {
    transition: none;
  }
}
`;

    function JsonToolPage({ t }) {
      const [text, setText] = React.useState('');
      const [output, setOutput] = React.useState('');
      const [indent, setIndent] = React.useState(2);
      const [status, setStatus] = React.useState({ kind: 'idle', message: null, detail: null });
      const [copied, setCopied] = React.useState(false);
      const inputRef = React.useRef(null);

      React.useEffect(() => {
        if (!copied) return undefined;
        const timer = window.setTimeout(() => setCopied(false), 1800);
        return () => window.clearTimeout(timer);
      }, [copied]);

      const describe = (value) => {
        if (value === null) return t('topNull');
        if (Array.isArray(value)) return t('topArray', { count: formatCount(value.length) });
        if (typeof value === 'object') return t('topObject', { count: formatCount(Object.keys(value).length) });
        if (typeof value === 'string') return t('topString');
        if (typeof value === 'number') return t('topNumber');
        if (typeof value === 'boolean') return t('topBoolean');
        return '';
      };

      const run = (mode) => {
        const raw = text.trim();
        if (raw === '') {
          setOutput('');
          setStatus({ kind: 'idle', message: t('emptyHint'), detail: null });
          return;
        }
        const parsed = parseJson(raw);
        if (!parsed.ok) {
          setOutput('');
          setStatus({
            kind: 'error',
            message: parsed.at === null
              ? t('errorTitle')
              : t('errorTitle') + ' · ' + t('errorAt', parsed.at),
            detail: parsed.message,
          });
          return;
        }
        const next = stringifyJson(parsed.value, mode === 'minify' ? 0 : indent);
        const delta = sizeDelta(raw.length, next.length);
        let deltaText = t('deltaSame');
        if (delta > 0) deltaText = t('deltaUp', { percent: delta });
        else if (delta < 0) deltaText = t('deltaDown', { percent: Math.abs(delta) });
        setOutput(next);
        setStatus({
          kind: 'ok',
          message: t('done', {
            input: formatCount(raw.length),
            output: formatCount(next.length),
            delta: deltaText,
          }) + ' \u00b7 ' + describe(parsed.value),
          detail: null,
        });
      };

      const clearAll = () => {
        setText('');
        setOutput('');
        setStatus({ kind: 'idle', message: null, detail: null });
        if (inputRef.current !== null) inputRef.current.focus();
      };

      const replaceInput = () => {
        if (output === '') return;
        setText(output);
        setOutput('');
        setStatus({ kind: 'idle', message: null, detail: null });
        if (inputRef.current !== null) inputRef.current.focus();
      };

      const copyOutput = () => {
        if (output === '') return;
        const clipboard = navigator.clipboard;
        if (clipboard === undefined || typeof clipboard.writeText !== 'function') {
          setStatus({ kind: 'error', message: t('copyFailed'), detail: null });
          return;
        }
        clipboard.writeText(output).then(
          () => setCopied(true),
          () => setStatus({ kind: 'error', message: t('copyFailed'), detail: null }),
        );
      };

      const onInputChange = (event) => {
        setText(event.target.value);
        if (status.kind !== 'idle') setStatus({ kind: 'idle', message: null, detail: null });
        if (copied) setCopied(false);
      };

      const onInputKeyDown = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          run('format');
        }
      };

      const inputMeta = text === '' ? '' : t('charsLines', {
        chars: formatCount(text.length),
        lines: formatCount(lineCount(text)),
      });
      const outputMeta = output === '' ? '' : t('charsLines', {
        chars: formatCount(output.length),
        lines: formatCount(lineCount(output)),
      });

      let statusClass = 'dsh-jt-status';
      if (status.kind === 'ok') statusClass += ' is-ok';
      else if (status.kind === 'error') statusClass += ' is-error';

      return h('div', { className: 'dsh-jt-root' },
        h('style', null, CSS),
        h('div', { className: 'dsh-jt-page' },
          h('header', { className: 'dsh-jt-head' },
            h('div', { className: 'dsh-jt-brand' },
              h('span', { className: 'dsh-jt-mark' }, h(JsonGlyph, { size: 26 })),
              h('div', { className: 'dsh-jt-titles' },
                h('h1', null, t('title')),
                h('p', { className: 'dsh-jt-sub' }, t('subtitle')))),
            h('span', { className: 'dsh-jt-shortcut' }, t('shortcut'))),
          h('section', { className: 'dsh-jt-card' },
            h('div', { className: 'dsh-jt-toolbar' },
              h('button', {
                type: 'button',
                className: 'dsh-jt-btn is-primary',
                onClick: () => run('format'),
              }, t('format')),
              h('button', {
                type: 'button',
                className: 'dsh-jt-btn',
                onClick: () => run('minify'),
              }, t('minify')),
              h('div', {
                className: 'dsh-jt-seg',
                role: 'group',
                'aria-label': t('indentLabel'),
              },
              h('button', {
                type: 'button',
                'aria-pressed': indent === 2,
                onClick: () => setIndent(2),
              }, t('indent2')),
              h('button', {
                type: 'button',
                'aria-pressed': indent === 4,
                onClick: () => setIndent(4),
              }, t('indent4'))),
              h('span', { className: 'dsh-jt-spacer' }),
              h('button', {
                type: 'button',
                className: 'dsh-jt-btn',
                onClick: clearAll,
              }, t('clear'))),
            h('div', { className: 'dsh-jt-panels' },
              h('div', { className: 'dsh-jt-panel' },
                h('div', { className: 'dsh-jt-label' },
                  h('span', null, t('inputLabel')),
                  h('span', { className: 'dsh-jt-meta' }, inputMeta)),
                h('textarea', {
                  ref: inputRef,
                  className: 'dsh-jt-area',
                  value: text,
                  onChange: onInputChange,
                  onKeyDown: onInputKeyDown,
                  placeholder: t('inputPlaceholder'),
                  spellCheck: false,
                  autoComplete: 'off',
                  autoCorrect: 'off',
                  autoCapitalize: 'off',
                  wrap: 'off',
                  'aria-label': t('inputLabel'),
                  autoFocus: true,
                })),
              h('div', { className: 'dsh-jt-panel' },
                h('div', { className: 'dsh-jt-label' },
                  h('span', null, t('outputLabel')),
                  h('span', { className: 'dsh-jt-actions' },
                    h('span', { className: 'dsh-jt-meta' }, outputMeta),
                    h('button', {
                      type: 'button',
                      className: 'dsh-jt-mini',
                      onClick: replaceInput,
                      disabled: output === '',
                    }, t('replaceInput')),
                    h('button', {
                      type: 'button',
                      className: 'dsh-jt-mini',
                      onClick: copyOutput,
                      disabled: output === '',
                    }, copied ? t('copied') : t('copy')))),
                h('textarea', {
                  className: 'dsh-jt-area is-output',
                  value: output,
                  readOnly: true,
                  placeholder: t('outputPlaceholder'),
                  spellCheck: false,
                  wrap: 'off',
                  'aria-label': t('outputLabel'),
                }))),
            h('div', { className: statusClass, role: 'status', 'aria-live': 'polite' },
              h('span', { className: 'dsh-jt-status-text' },
                status.message === null ? '' : status.message,
                status.detail === null ? null : h('span', { className: 'dsh-jt-detail' }, status.detail)))),
          h('footer', { className: 'dsh-jt-foot' },
            h('span', null, t('localNote')))));
    }

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'json-tools: dictionaries');

      const t = ctx.locale.bind(NS);
      const connectedPage = (props) => h(JsonToolPage, props.t === undefined ? { ...props, t } : props);

      ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
        locale: NS,
      }, connectedPage));

      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 50,
        locale: NS,
        label: () => t('title'),
      }, JsonGlyph));
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    };
  },
});
