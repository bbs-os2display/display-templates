import React, { useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import { createGlobalStyle } from "styled-components";
import BaseSlideExecution from "../base-slide-execution";
import { getFirstMediaUrlFromField } from "../slide-util";
import "./table.scss";

/** Setup theme vars */
/* TODO: Css from theme editor goes inside `ThemeStyles` */
/* TODO: Replace class `.table` with unique id/class from slide. */
const ThemeStyles = createGlobalStyle`
    -table {
      --bg-light: aliceblue;
      --text-dark: navy;
      --text-primary: navy;
    }
  `;

/**
 * Table component.
 *
 * @param {object} props Props.
 * @param {object} props.slide The slide.
 * @param {object} props.content The slide content.
 * @param {boolean} props.run Whether or not the slide should start running.
 * @param {Function} props.slideDone Function to invoke when the slide is done playing.
 * @returns {object} The component.
 */
function Table({ slide, content, run, slideDone }) {
  // Styling from content
  const { fontSize, fontPlacement } = content.styling || {};
  const textClasses = `text ${fontSize}`;

  // Content
  const { table, title, text } = content;
  const header = table.shift();

  // Image
  const rootStyle = {};
  const backgroundImageUrl = getFirstMediaUrlFromField(
    slide.mediaData,
    content.backgroundImage
  );
  if (backgroundImageUrl) {
    rootStyle.backgroundImage = `url("${backgroundImageUrl}")`;
  }

  /** Setup slide run function. */
  const slideExecution = new BaseSlideExecution(slide, slideDone);
  useEffect(() => {
    if (run) {
      slideExecution.start(slide.duration);
    } else {
      slideExecution.stop();
    }
  }, [run]);

  const gridStyle = {
    gridTemplateColumns: `${"auto ".repeat(header.columns.length)}`,
    display: "grid",
  };

  return (
    <>
      <div className="table" style={rootStyle}>
        <h1 className="header">{title}</h1>
        {fontPlacement === "top" && <div className={textClasses}>{text}</div>}
        <div style={gridStyle}>
          {header.columns.map((headerObject) => (
            <h2 key={headerObject.title} className="column-header">
              {headerObject.title}
            </h2>
          ))}
          {table.map((column) => (
            <Fragment key={`${column.toString()}`}>
              {header.columns.map(({ field }) => (
                <div key={column[field]} className="column">
                  {column[field]}
                </div>
              ))}
            </Fragment>
          ))}
          {fontPlacement === "bottom" && (
            <div classes={textClasses}>{text}</div>
          )}
        </div>
      </div>
      <ThemeStyles />
    </>
  );
}

Table.propTypes = {
  run: PropTypes.bool.isRequired,
  slideDone: PropTypes.func.isRequired,
  slide: PropTypes.shape({
    duration: PropTypes.number.isRequired,
    mediaData: PropTypes.objectOf(PropTypes.any),
  }).isRequired,
  content: PropTypes.shape({
    styling: PropTypes.shape({
      fontSize: PropTypes.string,
      fontPlacement: PropTypes.bool,
    }),
    title: PropTypes.string,
    text: PropTypes.string,
    table: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
    backgroundImage: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default Table;
