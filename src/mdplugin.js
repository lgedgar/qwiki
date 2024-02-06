
export default function qwiki_plugin (md) {

    const defaultText = md.renderer.rules.text

    md.renderer.rules.text = (tokens, idx, options, env, self) => {
        let text = defaultText(tokens, idx, options, env, self)

        // convert this:
        //
        //      [[display text|PageName]]
        //
        // to this:
        //
        //      <a class="qwiki" href="./PageName">display text</a>
        //
        // nb. qwiki class is used later to add the click handlers
        text = text.replace(/\[\[(?:([^\|\]]+)\|)?([^\]]+)\]\]/g, (match, p1, p2, offset, string) => {
            const linktext = p1 || p2
            return `<a href="${p2}" class="qwiki">${linktext}</a>`
        })

        return text
    }
}
