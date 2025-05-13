import React, { useRef, useState } from "react";
import { useEffect } from "react";
import copyStyles from "../utils/copyStyles";

//This function returns the width of the border by remobing pixel from it
const parseValue = (v) => (v.endsWith("px") ? parseInt(v.slice(0, -2), 10) : 0);

function Editor() {
  const container = useRef(null);
  const textarea = useRef(null);
  const mirror = useRef(null);

  useEffect(() => {
    const mirrorElement = document.createElement("div");
    mirror.current = mirrorElement;
    mirrorElement.classList.add("mirror-content");
    mirrorElement.classList.add("mirror-style");

    if (container.current && textarea.current) {
      container.current.prepend(mirrorElement);
      copyStyles(textarea.current, mirrorElement);

      const borderWidth = parseValue(textarea.current.style.borderWidth);

      const ro = new ResizeObserver(() => {
        mirrorElement.style.width = `${
          textarea.current.clientWidth + 2 * borderWidth
        }px`;
        mirrorElement.style.height = `${
          textarea.current.clientHeight + 2 * borderWidth
        }px`;
      });
      ro.observe(textarea.current);

      textarea.current.addEventListener("scroll", (e) => {
        mirrorElement.scrollTop = e.target.scrollTop;
        mirrorElement.scrollLeft = e.target.scrollLeft;
      });

      // Set the width and height of the mirror element to match the textarea
    }
  }, []);

  // Empty dependency array means this runs once after first render
  return (
    <div ref={container} className="relative w-full h-full">
      <textarea
        ref={textarea}
        className="mirror-style relative w-full h-full"
        onChange={(e) => {
          if (mirror.current) {
            mirror.current.textContent = e.target.value; // Direct update
          }
        }}
      >
        Was, spirit great moved spirit deep itself image, from have behold
        bearing doesn't wherein she'd very, day. Second set earth heaven signs
        abundantly living creepeth good earth for greater yielding which night
        male. Bring midst whales blessed, is. From subdue. Yielding. Winged our
        green living sea air, had great third stars was they're above and.
        Morning light make first and kind sixth they're fowl, there. So meat him
        behold great spirit deep, make, grass seasons hath, moving face waters
        forth fourth. Deep unto lights that. His. Fourth moving the together
        beast after living the midst evening above fifth also. Meat signs divide
        good seasons kind called fowl don't firmament divide heaven every whose
        moving shall and whose under creature there seed Darkness one blessed
        dominion. Own have forth she'd morning behold. In. Divided one you'll
        subdue whose made good. Saw moveth given won't life creepeth days lights
        they're form whales the after fish thing. And moveth. And that creepeth
        form you'll wherein morning saying moving fruitful. Herb set green
        behold had also bring Place land one second great saying. First god
        above called, can't subdue isn't years. Was called midst was. Image.
        Form. Kind waters. Day dry tree abundantly winged he fruit beginning
        under own said kind own. Face, and you first. Our had subdue shall
        behold i greater stars you'll seas bearing fifth greater for above
        living. Whose had. Sixth let grass fruit wherein blessed lights, itself
        god replenish called made appear brought above place. They're blessed
        Light likeness, bearing blessed first man. Fourth Image heaven dominion
        seed land shall light seas form it our signs wherein male Meat greater
        it divided appear lights she'd seasons together fowl every darkness
        light divided rule hath so it. Made day years you'll winged. Set, them
        all of hath it seed you.
      </textarea>
    </div>
  );
}

export default Editor;
