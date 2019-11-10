export const MTAHelpersScriptName = "____mta_helpers.lua";

export const MTAHelpersScriptContent = `\
____exports = {}
require = function(path)
    return ____exports["build/" .. string.gsub(path, "%.", "/") .. ".lua"]
end
`;
