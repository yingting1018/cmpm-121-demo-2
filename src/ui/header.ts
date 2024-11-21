export function setupHeader(app: HTMLDivElement, gameName: string) {
    document.title = gameName;

    const header = document.createElement("h1");
    header.innerHTML = gameName;
    app.append(header);
}