const tableSize = 874;
const tableMargin = 350;

export const memberImageSize = {
    width: 250,
    height: 250
};

export const getPosition = (screen, memberIndex, maxCount) => {
    memberIndex = parseInt(memberIndex);

    let coordinates;

    const angle = 2 * Math.PI / maxCount * memberIndex;

    coordinates = {
        x: ((tableSize + tableMargin) / 2) * Math.cos(angle) + screen.width / 2 - memberImageSize.width / 2 + 150,
        y: ((tableSize + tableMargin) / 2) * Math.sin(angle) + screen.height / 2 - memberImageSize.height / 2,
    }

    return coordinates;
}