<!-- Main layout for the entire application -->
<script>
  import '../app.css';
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<!-- This layout wraps all pages -->
{@render children?.()} 