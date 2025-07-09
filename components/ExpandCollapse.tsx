'use client';

import React, { Component, ReactNode } from 'react';
import PropTypes from 'prop-types';
interface ExpandCollapseProps {
  previewHeight: string;
  children: ReactNode;
  className?: string;
  expanded?: boolean;
  expandText?: ReactNode;
  collapseText?: ReactNode;
  collapse?: boolean;
  ellipsis?: boolean;
  ellipsisText?: string;
  onExpandClick?: ((event: React.MouseEvent<HTMLSpanElement>) => void) | null;
  onCollapseClick?: ((event: React.MouseEvent<HTMLSpanElement>) => void) | null;
  onClick?: ((event: React.MouseEvent<HTMLSpanElement>) => void) | null;
}

interface ExpandCollapseState {
  expanded: boolean;
  shouldExpand: boolean;
}

class ExpandCollapse extends Component<ExpandCollapseProps, ExpandCollapseState> {
  static propTypes = {
    previewHeight: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    expanded: PropTypes.bool,
    expandText: PropTypes.node,
    collapseText: PropTypes.node,
    collapse: PropTypes.bool,
    ellipsis: PropTypes.bool,
    ellipsisText: PropTypes.string,
    onExpandClick: PropTypes.func,
    onCollapseClick: PropTypes.func,
    onClick: PropTypes.func,
  };

  static defaultProps: Partial<ExpandCollapseProps> = {
    className: '',
    expanded: false,
    expandText: 'Expand',
    collapseText: 'Collapse',
    collapse: true,
    ellipsis: true,
    ellipsisText: '...',
    onExpandClick: null,
    onCollapseClick: null,
    onClick: null,
  };

  private toggleContent: HTMLDivElement | null = null;

  constructor(props: ExpandCollapseProps) {
    super(props);
    this.state = {
      expanded: !!props.expanded,
      shouldExpand: true,
    };
  }

  componentDidMount() {
    this.shouldDataExpand();
  }

  componentDidUpdate(prevProps: ExpandCollapseProps) {
    if (prevProps.children !== this.props.children) {
      this.shouldDataExpand();
    }
    if (prevProps.expanded !== this.props.expanded && this.props.expanded !== this.state.expanded) {
      this.setState({ expanded: !!this.props.expanded });
    }
  }

  handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    this.setState(
      (prevState) => ({
        expanded: !prevState.expanded,
      }),
      () => {
        const { expanded } = this.state;
        const { onExpandClick, onCollapseClick, onClick } = this.props;

        if (onExpandClick && expanded) {
          onExpandClick(event);
        }
        if (onCollapseClick && !expanded) {
          onCollapseClick(event);
        }
        if (onClick) {
          onClick(event);
        }
        this.setScrollPosition();
      },
    );
  };

  setScrollPosition = () => {
    if (!this.state.expanded && this.toggleContent) {
      const contentRect = this.toggleContent.getBoundingClientRect();
      if (contentRect.top < 0) {
        const offsetTop = Math.abs(contentRect.top + (window.pageYOffset || document.documentElement.scrollTop));
        window.scrollTo(0, offsetTop);
      }
    }
  };

  shouldDataExpand = () => {
    if (this.toggleContent) {
      const contentBodyFirstChild = this.toggleContent.firstChild?.firstChild as HTMLElement;

      if (contentBodyFirstChild) {
        const contentBodyRect = contentBodyFirstChild.getBoundingClientRect();
        const previewHeightNum = parseInt(this.props.previewHeight, 10);
        if (contentBodyRect.height <= previewHeightNum && !this.state.expanded) {
          this.setState({ shouldExpand: false });
        } else {
          this.setState({ shouldExpand: true });
        }
      } else {
        this.setState({ shouldExpand: false });
      }
    }
  };

  getContentHeight = (): string => {
    const { expanded, shouldExpand } = this.state;
    const { previewHeight } = this.props;

    if (expanded || !shouldExpand) {
      return 'auto';
    }
    return previewHeight;
  };

  getButton = (): ReactNode => {
    const { expanded, shouldExpand } = this.state;
    const { collapse } = this.props;

    if (shouldExpand) {
      if (!collapse && expanded) {
        return null;
      }
      const buttonText = this.getButtonText();

      const commonButtonClasses = 'leading-none text-primary font-bold cursor-pointer';
      const collapsedButtonClasses = 'absolute bottom-0 right-0 bg-white pl-[0.5em]';
      const expandedButtonClasses = 'relative block mt-2 pl-[5px] self-end';

      return (
        <span
          className={`${commonButtonClasses} ${expanded ? expandedButtonClasses : collapsedButtonClasses}`}
          onClick={this.handleClick}
          aria-label={typeof buttonText === 'string' ? buttonText : undefined}
          aria-expanded={expanded}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') this.handleClick(e as any);
          }}
        >
          {!expanded && (
            <span
              aria-hidden="true"
              className="absolute top-0 left-[-48px] h-full w-[48px] bg-gradient-to-r from-transparent to-white"
            />
          )}
          {buttonText}
        </span>
      );
    }
    return null;
  };

  getButtonText = (): ReactNode => {
    const { expanded } = this.state;
    const { expandText, collapseText, ellipsis, ellipsisText } = this.props;
    const text = expanded ? collapseText : expandText;
    if (ellipsis && !expanded) {
      return (
        <>
          {ellipsisText} {text}
        </>
      );
    }
    return text;
  };

  setRef = (ref: HTMLDivElement | null) => {
    this.toggleContent = ref;
  };

  render() {
    const { children, className: externalClassName } = this.props;
    const { expanded } = this.state;
    const contentHeight = this.getContentHeight();
    const button = this.getButton();

    const containerBaseClasses = 'relative overflow-x-visible';
    const containerCollapsedClasses = 'overflow-y-hidden';

    return (
      <div
        className={`${containerBaseClasses} ${
          expanded ? 'overflow-visible' : containerCollapsedClasses
        } ${externalClassName || ''}`}
        ref={this.setRef}
        style={{ height: contentHeight }}
      >
        <div>{children}</div>
        {expanded && button && <div className="flex w-full justify-end">{button}</div>}
        {!expanded && button}
      </div>
    );
  }
}

export default ExpandCollapse;
