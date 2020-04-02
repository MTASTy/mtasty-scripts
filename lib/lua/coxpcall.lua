_pcall, _xpcall = pcall, xpcall
coroutine._running = coroutine.running

local pack = table.pack or function(...) return {n = select("#", ...), ...} end
local unpack = table.unpack or unpack
local coromap = setmetatable({}, { __mode = "k" })

function handleReturnValue(err, co, status, ...)
    if not status then
        return false, err(debug.traceback(co, (...)), ...)
    end
    if coroutine.status(co) == 'suspended' then
        return performResume(err, co, coroutine.yield(...))
    else
        return true, ...
    end
end

function performResume(err, co, ...)
    return handleReturnValue(err, co, coroutine._resume(co, ...))
end

local function id(trace, ...)
    return trace
end

function xpcall(f, err, ...)
    local current = coroutine._running()
    if not current then
        if err == id then
            return _pcall(f, ...)
        else
            if select("#", ...) > 0 then
                local oldf, params = f, pack(...)
                f = function() return oldf(unpack(params, 1, params.n)) end
            end
            return _xpcall(f, err)
        end
    else
        local res, co = _pcall(coroutine.create, f)
        if not res then
            local newf = function(...) return f(...) end
            co = coroutine.create(newf)
        end
        coromap[co] = current
        return performResume(err, co, ...)
    end
end

function pcall(f, ...)
    return xpcall(f, id, ...)
end

function coroutine.running(co)
    if co ~= nil then
        assert(type(co)=="thread", "Bad argument; expected thread, got: " .. type(co))
    else
        co = coroutine._running()
    end
    while coromap[co] do
        co = coromap[co]
    end
    if co == "mainthread" then return nil end
    return co
end
