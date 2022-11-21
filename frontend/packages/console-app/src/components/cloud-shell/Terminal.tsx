import * as React from 'react';
import { Terminal as XTerminal, ITerminalOptions } from 'xterm';
import { fit } from 'xterm/lib/addons/fit/fit';

import './Terminal.scss';

const terminalOptions: ITerminalOptions = {
  fontFamily: 'monospace',
  fontSize: 16,
  cursorBlink: false,
  cols: 80,
  rows: 25,
};

type TerminalProps = {
  onData: (data: string) => void;
};

export type ImperativeTerminalType = {
  focus: () => void;
  reset: () => void;
  onDataReceived: (data) => void;
  onConnectionClosed: (msg: string) => void;
};

const Terminal = React.forwardRef<ImperativeTerminalType, TerminalProps>(({ onData }, ref) => {
  const terminal = React.useRef<XTerminal>();
  const terminalRef = React.useRef<HTMLDivElement>();

  React.useEffect(() => {
    const term: XTerminal = new XTerminal(terminalOptions);
    term.open(terminalRef.current);
    term.focus();

    const resizeObserver: ResizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => fit(term));
    });

    resizeObserver.observe(terminalRef.current);

    if (terminal.current !== term) {
      terminal.current && terminal.current.destroy();
      terminal.current = term;
    }

    return () => {
      term.destroy();
      resizeObserver.disconnect();
    };
  }, []);

  React.useEffect(() => {
    const term = terminal.current;
    term.on('data', onData);

    return () => {
      term.off('data', onData);
    };
  }, [onData]);

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      terminal.current && terminal.current.focus();
    },
    reset: () => {
      if (!terminal.current) return;
      terminal.current.reset();
      terminal.current.clear();
      terminal.current.setOption('disableStdin', false);
    },
    onDataReceived: data => {
      terminal.current && terminal.current.write(data);
    },
    onConnectionClosed: msg => {
      if (!terminal.current) return;
      terminal.current.write(`\x1b[31m${msg || 'disconnected'}\x1b[m\r\n`);
      terminal.current.setOption('disableStdin', true);
    },
  }));

  // init height
  const [terminalHeight, setTerminalHeight] = React.useState(0);
  React.useEffect(() => {
    const element = document.getElementById('hypercloudshell-body') ?? document.getElementById('hypercloudshell-tab-body');
    const { height } = element.getBoundingClientRect();
    setTerminalHeight(height);

    if (element.id === 'hypercloudshell-tab-body') {
      window.addEventListener('resize', () => setTerminalHeight(element.getBoundingClientRect().height));
      return () => {
        window.removeEventListener('resize', () => setTerminalHeight(element.getBoundingClientRect().height));
      };
    }
  }, []);

  return <div className="co-terminal" id="hypercloud-terminal" ref={terminalRef} style={{ height: `${terminalHeight}px` }} />;
});

export default Terminal;
