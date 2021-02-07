const outputWrapper = `<div class="left">
    <div class="image-name"><%- imageName %></div>
    <div class="dataURI">
      <pre><%= dataURI %></pre>
    </div>
    <div class="image-info">
      <p><span>Original file size:</span> <%= originalImageSize %> bytes</p>
      <% if (fileSizeReduction !== null) { %>
      <p><span>After optimisation:</span> <%= fileSizeReduction %></p>
      <% } else { %>
      <p><span>No image optimisation has taken place</span></p>
      <% } %>
      <p><span>Data URI size:</span> <%= dataURIsize %> bytes</p>
      <% var elapsed = (end - start) / 1000 %>
      <p>Processed in <% print (elapsed) %> seconds</p>
      <% if (fileSizeReduction !== null && (originalImageSize < dataURIsize)) { %>
      <p class="last">If the image has been optimised then why is the returned data URI still
        larger?</p>
      <p class="last-hidden">Data URIs are always bigger than an image. So, even though the image has been shrunk,
        once it is converted to a data URI it may still be larger</p>
      <% } %>
    </div>

  </div>
  <div class="right">
    <div class="right-image">
      <a href="<%= dataURI %>" download="<%- imageName %>">
        <img alt="" src="<%= dataURI %>"/>
      </a>
      <p>Left click on the above image to download</p>
    </div>
  </div>`;

const errorWrapper = ` <div class="inner-error">
    <img src="img/error-message.png" width="647" height="704"
         alt="Mister, I hear if you upload anything other PNG, GIF or JPEGs then the sheriff is gonna start shooting kittens"/>
  </div>`;

export {outputWrapper, errorWrapper};
