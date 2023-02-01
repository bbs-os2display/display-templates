import React, { useEffect, useRef, useState } from "react";
import "./event.scss";
import "../Font/font.scss";
import GlobalStyles from "../GlobalStyles";
import { ThemeStyles, useDimensions } from '../slide-util';
import { format, utcToZonedTime } from "date-fns-tz";
import isLocale from "date-fns/locale/is";
import { parseString } from 'xml2js';

const formatEventDate = (timestamp) => {
  const date = utcToZonedTime(new Date(timestamp), 'GMT');
  return {
    date: format(date, "EEEE d. MMMM", { locale: isLocale }).replace(/^\w/, (letter) =>
      letter.toUpperCase()
    ),
    time: format(date, "HH:mm", { locale: isLocale }).replace(/^\w/, (letter) =>
      letter.toUpperCase()
    ),
  };
};

/**
 * Event details component.
 *
 * @param {object} props Props.
 * @param {string} props.title The title.
 * @param {string} props.subTitle The subtitle.
 * @returns {object} The component.
 */
const EventDetails = ({ title, subTitle }) => {
  return (
    <>
      <div className="event-details">
        <div className="event-details__title">
          <h1>{title}</h1>
        </div>
        <div className="event-details__sub-title">
          <h2>{subTitle}</h2>
        </div>
      </div>
    </>
  );
};

/**
 * Event component.
 *
 * @param {object} props Props.
 * @param {object} props.slide The slide.
 * @param {object} props.content The slide content.
 * @param {Function} props.slideDone Function to invoke when the slide is done playing.
 * @returns {object} The component.
 */
const Event = ({ slide, content, slideDone, executionId }) => {
  const ref = useRef(null);
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const dimensions = useDimensions(ref);
  let layout = "horizontal";
  if (dimensions.height / dimensions.width > 0.8) {
    layout = "vertical";
  }

  // Content from content.
  const {
    feed,
    amount,
    duration = 10000,
  } = content;

  const { title, image, subTitle, host, startDate, endDate } = data ? data[currentPage] : {};

  useEffect(() => {
    fetch(feed)
      .then(res => res.text())
      .then(data => {
        parseString(data, (err, result) => {
          if (!result || !result?.rss?.channel?.length || !result.rss.channel[0]?.item?.length) {
            slideDone(slide);
            return;
          }

          setData(result.rss.channel[0].item.slice(0, amount).map(item => {
            const start = formatEventDate(item['content-rss:arrangement-starttime'][0] * 1000);
            const end = formatEventDate(item['content-rss:arrangement-endtime'][0] * 1000);

            return {
              title: item.title[0],
              subTitle: item['content-rss:subheadline'][0] || '',
              image: item['media:content'][0].$.url || '',
              host: item['content-rss:arrangement-location'][0] || '',
              startDate: `${start.date} kl. ${start.time}`,
              endDate: start.date !== end.date && `${end.date} kl. ${end.time}`,
            };
          }));
        });
      })
      .catch(console.error);
  }, []);

  const bgColor = content.bgColor || "#000c2e";
  const textColor = content.textColor || "#fff";

  const rootClasses = [
    "template-event",
    "event",
    `layout-${layout}`,
  ];
  const rootStyle = {
    backgroundColor: bgColor,
    color: textColor,
    "--width": dimensions.width,
    "--height": dimensions.height,
  };

  useEffect(() => {
    if (!data) {
      return;
    }

    const pageInterval = setInterval(
      () => {
        if (currentPage < data?.length - 1) {
          setCurrentPage(currentPage + 1);
        } else {
          slideDone(slide);
          setCurrentPage(0);
        }
      }, duration);

    return function cleanup() {
      clearInterval(pageInterval);
    };
  }, [data, currentPage]);

  if (layout === "vertical") {
    return (
      <>
        <div ref={ref} className={rootClasses.join(" ")} style={rootStyle}>
          <div className="event-top">
            <div className="event-top__text">
              <div className="event__host event-top__host">{host}</div>
              <div className="event__date">
                <span>{startDate}</span>
                {endDate && <span>{endDate}</span>}
              </div>
            </div>
          </div>
          <div className="event-top__image">
            <img src={image} alt="" />
          </div>
          <EventDetails title={title} subTitle={subTitle} />
        </div>
        <ThemeStyles id="template-event" css={slide?.themeData?.css} />
        <GlobalStyles />
      </>
    );
  }

  return (
    <>
      <div ref={ref} className={rootClasses.join(" ")} style={rootStyle}>
        <div className="event__image">
          <img src={image} alt="" />
        </div>
        <div className="event-info">
          <div className="event-info__top">
            <div className="event-top__text">
              <div className="event__host event-info__host">{host}</div>
              <div className="event__date">
                <span>{startDate}</span>
                {endDate && <span>{endDate}</span>}
              </div>
            </div>
          </div>
          <EventDetails title={title} subTitle={subTitle} />
        </div>
      </div>
      <ThemeStyles id={executionId} css={slide?.themeData?.css} />
      <GlobalStyles />
    </>
  );
};

export default Event;
