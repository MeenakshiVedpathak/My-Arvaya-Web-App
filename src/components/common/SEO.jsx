import { useEffect, useRef } from "react";

const META_TYPES = ["name", "property", "itemprop"];

export default function SEO({ title, description, keywords, canonical, ogImage, ogType }) {
  const prevRef = useRef(null);

  useEffect(() => {
    if (!title && !description && !canonical) return;

    const saved = {
      title: document.title,
      meta: new Map(),
    };

    META_TYPES.forEach((attr) => {
      document.querySelectorAll(`meta[${attr}]`).forEach((el) => {
        const key = `${attr}:${el.getAttribute(attr)}`;
        saved.meta.set(key, el.getAttribute("content") || "");
      });
    });

    prevRef.current = saved;

    if (title) {
      document.title = title;
    }

    const updateMeta = (attr, name, value) => {
      const key = `${attr}:${name}`;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (value) {
        if (el) {
          el.setAttribute("content", value);
        } else {
          el = document.createElement("meta");
          el.setAttribute(attr, name);
          el.setAttribute("content", value);
          document.head.appendChild(el);
        }
      }
    };

    if (description) updateMeta("name", "description", description);
    if (keywords) updateMeta("name", "keywords", keywords);

    if (canonical) {
      let link = document.querySelector(`link[rel="canonical"]`);
      if (link) {
        link.setAttribute("href", canonical);
      } else {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        link.setAttribute("href", canonical);
        document.head.appendChild(link);
      }
    }

    if (ogImage) updateMeta("property", "og:image", ogImage);
    if (ogType) updateMeta("property", "og:type", ogType);

    return () => {
      const prev = prevRef.current;
      if (!prev) return;
      document.title = prev.title;
      META_TYPES.forEach((attr) => {
        document.querySelectorAll(`meta[${attr}]`).forEach((el) => {
          const key = `${attr}:${el.getAttribute(attr)}`;
          if (prev.meta.has(key)) {
            el.setAttribute("content", prev.meta.get(key));
          } else {
            el.remove();
          }
        });
      });
      const canonicalLink = document.querySelector(`link[rel="canonical"]`);
      if (canonicalLink) canonicalLink.remove();
    };
  }, [title, description, keywords, canonical, ogImage, ogType]);

  return null;
}
