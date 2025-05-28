"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
  MouseEvent as ReactMouseEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import PropTypes from "prop-types";

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
  onExpandClick?: ((event: ReactMouseEvent<HTMLSpanElement>) => void) | null;
  onCollapseClick?: ((event: ReactMouseEvent<HTMLSpanElement>) => void) | null;
  onClick?: ((event: ReactMouseEvent<HTMLSpanElement>) => void) | null;
}

const ExpandCollapse: React.FC<ExpandCollapseProps> = (props) => {
  const {
    previewHeight,
    children,
    className = "",
    expanded: initialExpanded = false,
    expandText = "Expand",
    collapseText = "Collapse",
    collapse = true,
    ellipsis = true,
    ellipsisText = "...",
    onExpandClick = null,
    onCollapseClick = null,
    onClick = null,
  } = props;

  const [expanded, setExpanded] = useState(!!initialExpanded);
  const [shouldExpand, setShouldExpand] = useState(true);
  const toggleContentRef = useRef<HTMLDivElement | null>(null);

  const setScrollPosition = useCallback(() => {
    if (!expanded && toggleContentRef.current) {
      const contentRect = toggleContentRef.current.getBoundingClientRect();
      if (contentRect.top < 0) {
        const offsetTop = Math.abs(
          contentRect.top +
            (window.pageYOffset || document.documentElement.scrollTop)
        );
        window.scrollTo(0, offsetTop);
      }
    }
  }, [expanded]); // Depends on the current `expanded` state

  const determineShouldExpand = useCallback(() => {
    if (toggleContentRef.current) {
      const contentRect = toggleContentRef.current.getBoundingClientRect();
      const contentBody = toggleContentRef.current.querySelector(
        ".react-expand-collapse__body"
      );
      if (contentBody) {
        const contentBodyRect = contentBody.getBoundingClientRect();
        // If content height is less than previewHeight and component is not forced expanded
        if (
          contentRect.height >= contentBodyRect.height &&
          !expanded // Use the current `expanded` state
        ) {
          setShouldExpand(false);
        } else {
          setShouldExpand(true);
        }
      } else {
        setShouldExpand(true);
      }
    }
  }, [expanded]); // Depends on the current `expanded` state

  useEffect(() => {
    determineShouldExpand();
  }, [props.children, determineShouldExpand]); // Re-run if children or the checker itself changes

  // Effect for handling scroll position after expansion state changes
  useEffect(() => {
    // Only call setScrollPosition if it's relevant (i.e., if it just collapsed)
    // The setScrollPosition function itself checks if `!expanded`
    setScrollPosition();
  }, [expanded, setScrollPosition]);

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLSpanElement>) => {
      const nextExpanded = !expanded;
      setExpanded(nextExpanded); // Update state first

      // Callbacks based on the *new* state
      if (onExpandClick && nextExpanded) {
        onExpandClick(event);
      }
      if (onCollapseClick && !nextExpanded) {
        onCollapseClick(event);
      }
      if (onClick) {
        onClick(event);
      }
      // setScrollPosition is now handled by a useEffect hook watching `expanded`
    },
    [expanded, onExpandClick, onCollapseClick, onClick]
  );

  const getContentHeight = (): string => {
    if (expanded || !shouldExpand) {
      return "auto";
    }
    return previewHeight;
  };

  const getButtonText = (): ReactNode => {
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

  const buttonTextNode = getButtonText(); // Evaluate once

  const getButton = (): ReactNode => {
    if (shouldExpand) {
      if (!collapse && expanded) {
        return "";
      }
      return (
        <span
          className="react-expand-collapse__button"
          onClick={handleClick}
          aria-label={
            typeof buttonTextNode === "string" ? buttonTextNode : undefined
          }
          aria-expanded={expanded}
          role="button"
          tabIndex={0}
          onKeyDown={(e: ReactKeyboardEvent<HTMLSpanElement>) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault(); // Good practice for space/enter on button-like elements
              // Cast event type as original did, to fulfill handleClick's MouseEvent expectation
              handleClick(e as unknown as ReactMouseEvent<HTMLSpanElement>);
            }
          }}
        >
          {buttonTextNode}
        </span>
      );
    }
    return "";
  };

  const getClassName = (): string => {
    const expandedClass = expanded ? "react-expand-collapse--expanded" : "";
    return ["react-expand-collapse__content", expandedClass, className]
      .filter(Boolean)
      .join(" ");
  };

  const currentClassName = getClassName();
  const contentHeight = getContentHeight();
  const button = getButton();

  return (
    <div
      className={currentClassName}
      ref={toggleContentRef}
      style={{ height: contentHeight }}
    >
      <div className="react-expand-collapse__body">{children}</div>
      {button}
    </div>
  );
};

ExpandCollapse.propTypes = {
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

export default ExpandCollapse;
