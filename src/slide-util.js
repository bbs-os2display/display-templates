import { createGlobalStyle } from "styled-components";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

/**
 * Get the first media url of a media field.
 *
 * @param {object} mediaData The object of media objects.
 * @param {Array} field The field to get the first media url from.
 * @returns {string | any | null} The first media url of the field.
 */
function getFirstMediaUrlFromField(mediaData, field) {
  if (Array.isArray(field) && field.length > 0) {
    const media = mediaData[field[0]];

    if (media?.assets?.uri) {
      return media.assets.uri;
    }
    if (media?.url) {
      return media.url;
    }
    return null;
  }

  return null;
}

/**
 * Get the all media urls of a media field.
 *
 * @param {object} mediaData The object of media objects.
 * @param {Array} field The field to get the all media urls from.
 * @returns {string | any | null} Media urls for the given field.
 */
function getAllMediaUrlsFromField(mediaData, field) {
  if (Array.isArray(field)) {
    return field.reduce((previous, current) => {
      const media = mediaData[current];

      if (media?.assets?.uri) {
        previous.push(media.assets.uri);
      } else if (media?.url) {
        previous.push(media.url);
      }

      return previous;
    }, []);
  }

  return [];
}

function useDimensions(ref) {
  const getDimensions = () => ({
    width: ref.current?.offsetWidth || 0,
    height: ref.current?.offsetHeight || 0,
  });

  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions(getDimensions());
    };

    if (ref.current) {
      handleResize();
    }

    // The resize event will probably never occur in real life, but there's not
    // reason to not support it.
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [ref]);

  return dimensions;
}

/**
 * Create a theme style for a slide.
 *
 * @param {object} props Props.
 * @param {string} props.id Slide execution id.
 * @param {string | null} props.css Css as a string.
 * @returns {object} The component.
 */
function ThemeStyles({ id, css = null }) {
  if (!css) return <></>;

  const slideCss = css.replaceAll("#SLIDE_ID", `#${id}`);

  const ThemeComponent = createGlobalStyle`${slideCss}`;
  return <ThemeComponent />;
}

ThemeStyles.defaultProps = {
  css: null,
};

ThemeStyles.propTypes = {
  id: PropTypes.string.isRequired,
  css: PropTypes.string,
};

export { getAllMediaUrlsFromField, getFirstMediaUrlFromField, ThemeStyles, useDimensions };
