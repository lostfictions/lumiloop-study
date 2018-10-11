import * as React from "react";

interface WindowSizeProps {
  children: (props: { width: number; height: number }) => JSX.Element;
}

interface WindowSizeState {
  width: number;
  height: number;
}

export default class WindowDimensions extends React.Component<
  WindowSizeProps,
  WindowSizeState
> {
  dirty = false;

  constructor(props: WindowSizeProps) {
    super(props);

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  onResize = () => {
    if (!this.dirty) {
      this.dirty = true;
      requestAnimationFrame(() => {
        this.setState({
          width: window.innerWidth,
          height: window.innerHeight
        });
        this.dirty = false;
      });
    }
  };

  componentWillMount() {
    window.addEventListener("resize", this.onResize, false);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize, false);
  }

  render() {
    return this.props.children(this.state);
  }
}
