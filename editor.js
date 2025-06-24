pxt.editor.initExtensionsAsync = function (opts) {
    return Promise.resolve({
        beforeCompile: (resp) => {
            const mode = "einfach";
            const disallowedBlocks = {
                "einfach": ["init"],
                "profi": []
            };

            const disallowed = disallowedBlocks[mode] || [];

            const xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
            const blocks = xml.getElementsByTagName("block");

            for (let i = 0; i < blocks.length; i++) {
                const type = blocks[i].getAttribute("type");
                if (disallowed.includes(type)) {
                    alert(`Block "${type}" ist im Modus "${mode}" nicht erlaubt!`);
                    // Optional: Kompilierung abbrechen
                    throw new Error(`Verbotener Block: ${type}`);
                }
            }
        }
    });
}
