var script = document.createElement("script");
script.type = "text/javascript";
script.src =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
script.onload = () => console.log("daum postcode loaded");

/**
 * 스크립트 삽입
 */
var before = document.getElementsByTagName("script")[0];
before.parentNode.insertBefore(script, before);

/**
 *
 * @param {@angular/core/Renderer2} renderer
 * @param {@angular/core/ElementRef.nativeElement} elem
 * @param {주소선택완료시 콜백} callback
 */
export function postcode(renderer, elem, callback) {
  new daum.Postcode({
    oncomplete: (data) => {
      callback(data);
      elem.style.display = "none";
    },
    width: "100%",
    height: "100%",
    maxSuggestItems: 5,
  }).embed(elem);

  /**
   * 창크기 조정, 팝업창 센터로
   */
  var width = 380;
  var height = 480;
  var borderWidth = 1;

  renderer.setStyle(elem, "display", "block");
  renderer.setStyle(elem, "width", width + "px");
  renderer.setStyle(elem, "height", height + "px");
  // renderer.setStyle(elem, "border", borderWidth + "px solid");
  renderer.setStyle(
    elem,
    "left",
    ((window.innerWidth || document.documentElement.clientWidth) - width) / 2 -
      borderWidth +
      "px"
  );
  renderer.setStyle(
    elem,
    "top",
    ((window.innerHeight || document.documentElement.clientHeight) - height) /
      2 -
      borderWidth +
      "px"
  );
}
