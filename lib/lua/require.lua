____exports = {}
require = function(path)
    return ____exports["build/" .. string.gsub(path, "%.", "/") .. ".lua"]
end
