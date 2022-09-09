<footer>
  <div class="footer-content">
    <div>
      <p>Photos &copy; {import.meta.env.VITE_SITE_OWNER} {new Date().getFullYear()}</p>
      <small
        >We're using <a href="https://photos.traist.co.uk/" target="_blank" class="underline"
          >Traist Photos</a
        > to share our private photos!</small
      >
    </div>
    <div>
      <p>
        <a href="mailto:{import.meta.env.VITE_SITE_CONTACT}" class="underline"
          >{import.meta.env.VITE_SITE_CONTACT}</a
        >
      </p>
      <h3 class="font-bold mt-4 text-lg">Pages</h3>

      <p>
        <a href="/about">About</a>
      </p>
      <p>
        <a href="/collections">Collections</a>
      </p>
      <p>
        <a href="/loved">Loved</a>
      </p>
    </div>
  </div>
</footer>

<style lang="scss">
  footer {
    @apply py-4 md:py-12 bg-primary-700 text-primary-200;
    .footer-content {
      @apply container mx-auto grid grid-cols-2 divide-x-2 divide-primary-200;
      > * {
        @apply p-4;
      }
    }
  }
</style>
