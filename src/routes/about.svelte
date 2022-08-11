<section class="prose prose-primary my-4">
	<h1>About</h1>
	<p>
		Traist Photos is a web app for sharing photos securely with friends and family. No more secret
		Instagrams, or private WhatsApp groups, or Messenger chats, just a simple, self-hosted solution.
	</p>
	<p>Sharing private moments is safe, simple, and elegant.</p>
	<h2>How Safe Are My Photos?</h2>
	<p>
		Your photos are only viewable by users who have either the user password or the admin password
		to Traist Photos. Obviously, there is a risk that the password will be circulated, in which
		case, obviously more people would be able to access.
	</p>
	<p>
		Links that you share to photos in Traist Photos can only be opened by someone who has the
		password, so you can be sure that the photos are kept away from prying eyes.
	</p>
	<h3>Technical Details</h3>
	<p>
		Security in transit is provided whenever the site is hosted over an SSL connection. Security at
		rest is a bit more complicated. Traist Photos in its recommended configuration uses an
		encryption key for all photos, which means that your photos are fully encrypted at rest.
		Otherwise, the third party S3 host can be configured to manage Service Side Encryption for you,
		or a private S3 instance can be set up (e.g. Minio). For home users, Backblaze will store 10GB
		of data for free with generous transfer allowances which should be more than enough for most
		people.
	</p>
</section>
