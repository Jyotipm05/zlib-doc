/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DocItem, CategoryGroup } from '../types';

export const guides: Record<string, DocItem> = {
  intro: {
    id: 'intro',
    name: 'Introduction to zlib',
    category: 'Getting Started',
    type: 'guide',
    summary: 'An overview of the zlib library, its history, architecture, and the DEFLATE compression algorithm.',
    description: `### What is zlib?
    
**zlib** is a general-purpose, lossless data compression library designed to be free, patent-free, and highly portable. Originally written by Jean-loup Gailly (compression) and Mark Adler (decompression), it was first released in May 1995.

zlib is a foundational library of the modern internet. It is embedded in:
- The **PNG** image format for pixel compression.
- Major web browsers and servers to compress HTTP traffic (**Content-Encoding: gzip** or **deflate**).
- **Git** for object storage and packet transmission limit management.
- Linux kernels, databases, and programming runtimes (including Node.js, Python, Java, PHP).

---

### The DEFLATE Algorithm
Under the hood, zlib uses the **DEFLATE** compression algorithm. DEFLATE is a combination of two distinct lossless compression methods:

1. **LZ77 (Lempel-Ziv 1977)**: A sliding window compression algorithm that finds repeated substrings of data and replaces duplicates with a reference tuple: \`(distance, length)\`.

2. **Huffman Coding**: An entropy coding scheme that assigns variable-length binary codes to characters or tokens. Frequently appearing symbols get shorter codes (e.g., 2 bits), while rare symbols get longer codes (e.g., 12 bits).

The strengths of DEFLATE are:
- **No patent encumbrances**: Clean implementation that avoided trademark and patent litigation in the 90s.
- **Fast decompression**: Decompressing (inflating) requires very little CPU and memory compared to alternative formats like BZIP2 or LZMA.
- **Micro-footprint memory layout**: Can run on embedded devices with as little as 32KB of RAM.

---

### Library Architecture
The core zlib API is written in standard ANSI C. It centers around a single state-holding object: the **\`z_stream\`** structure. 

Whether compressing or decompressing, data is processed in a **stream-oriented** fashion:
1. You allocate and initialize a \`z_stream\`.
2. You feed input bytes into the stream buffer (\`next_in\`, \`avail_in\`).
3. You provide an output buffer (\`next_out\`, \`avail_out\`) for the engine to write the result.
4. You call the action function (\`deflate()\` or \`inflate()\`) in a loop.
5. Once the stream returns \`Z_STREAM_END\`, you tear down the structure (\`deflateEnd()\` or \`inflateEnd()\`).
`,
  },
  install: {
    id: 'install',
    name: 'Installation & Integration',
    category: 'Getting Started',
    type: 'guide',
    summary: 'Guidelines on compiling and integrating zlib into standard build environments (C/C++, CMake, Node.js, and browser).',
    description: `### Installing zlib

#### C/C++ (Linux & macOS)
Most Linux distributions and macOS include zlib by default. To compile against it, install the development headers:

\`\`\`bash
# Ubuntu / Debian
sudo apt-get install zlib1g-dev

# Fedora / Red Hat
sudo dnf install zlib-devel

# macOS (headers are installed with Xcode Command Line Tools)
xcode-select --install
\`\`\`

#### Building zlib From Source
If you need a specific version, you can download the tarball from [zlib.net](https://www.zlib.net):

\`\`\`bash
wget https://zlib.net/zlib-1.3.1.tar.gz
tar -xvf zlib-1.3.1.tar.gz
cd zlib-1.3.1
./configure --prefix=/usr/local
make
sudo make install
\`\`\`

---

### Compiling Your Code
When building your application, pass the \`-lz\` flag to link the zlib library:

\`\`\`bash
# Direct compilation with GCC
gcc main.c -o myapp -lz
\`\`\`

#### CMake Setup
To integrate zlib cleanly within a CMake project, use the standard modern find module:

\`\`\`cmake
cmake_minimum_required(VERSION 3.10)
project(ZlibExample C)

# Find the standard zlib install
find_package(ZLIB REQUIRED)

add_executable(myapp main.c)

# Link zlib targets safely
target_include_directories(myapp PRIVATE \${ZLIB_INCLUDE_DIRS})
target_link_libraries(myapp PRIVATE ZLIB::ZLIB)
\`\`\`

---

### Integration in Runtimes

#### Node.js
Node.js includes built-in bindings for zlib, so you do not need to install any external modules:

\`\`\`javascript
const zlib = require('zlib');
// or
import zlib from 'zlib';
\`\`\`

#### Browser Environment
Web browsers native support Compression APIs for streaming deflate/gzip in client web-apps. There is no external library needed for simple operations:

\`\`\`javascript
// Native Web streams
const compressionStream = new CompressionStream('gzip');
\`\`\`
`,
  },
  'quickstart-cpp': {
    id: 'quickstart-cpp',
    name: 'Quick Start: C/C++',
    category: 'Getting Started',
    type: 'guide',
    summary: 'A simple step-by-step example of memory-to-memory block compression in standard C++.',
    description: `### 1. Pure C-Style Stream Processing (Memory Constraints)

In classic standard C programs, buffer compression revolves around manual orchestration of a raw \`z_stream\` structure. While this process is highly performant and portable, it is fragile. Developers must manually call \`deflateEnd()\` on all exit paths, making it highly susceptible to memory leaks whenever validation checks fail or internal errors occur.

Here is the clean, structured standard C implementation using dynamic allocation and raw pointers:

\`\`\`c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <zlib.h>

#define CHUNK_SIZE 16384

uint8_t* compress_pure_c(const uint8_t* source, size_t source_len, size_t* out_len) {
    z_stream strm;
    // Zero-initialize fields to ensure safety
    memset(&strm, 0, sizeof(strm));

    if (deflateInit(&strm, Z_DEFAULT_COMPRESSION) != Z_OK) {
        return NULL;
    }

    strm.next_in = (Bytef*)source;
    strm.avail_in = (uInt)source_len;

    size_t out_cap = source_len + 100; // conservative buffer guess
    uint8_t* out_buf = (uint8_t*)malloc(out_cap);
    if (!out_buf) {
        deflateEnd(&strm);
        return NULL;
    }

    strm.next_out = out_buf;
    strm.avail_out = (uInt)out_cap;

    // Single step compression for entire buffer
    int ret = deflate(&strm, Z_FINISH);
    if (ret != Z_STREAM_END && ret != Z_OK) {
        free(out_buf);
        deflateEnd(&strm);
        return NULL;
    }

    *out_len = strm.total_out;
    deflateEnd(&strm);
    return out_buf;
}

int main(void) {
    const char* text = "Hello zlib! Standard C compilation maintains excellent legacy support.";
    size_t compressed_size = 0;
    
    uint8_t* compressed = compress_pure_c((const uint8_t*)text, strlen(text) + 1, &compressed_size);
    if (compressed) {
        printf("Raw Input: %zu bytes\\n", strlen(text) + 1);
        printf("Compressed Output: %zu bytes\\n", compressed_size);
        free(compressed);
    } else {
        printf("Compression failed.\\n");
    }
    return 0;
}
\`\`\`

To compile this pure C application, use your compiler to link standard zlib libraries:

\`\`\`bash
# Compile pure C example
gcc -O3 main.c -lz -o compress_c_binary
\`\`\`

---

### 2. High-Assurance Modern C++ Sections (C++17 / C++20)

In modern C++, combining zlib with modern standard libraries can lead to critical memory bugs if standard C++ paradigms (such as exceptions) are mixed with legacy manual stream deallocations.

#### ⚠️ The Exception Leak Danger:

Consider this common, dangerous anti-pattern code structure where developers mix standard containers with manual C-style cleanup:

\`\`\`cpp
// ❌ DANGEROUS ANTI-PATTERN: Susceptible to severe leaks on allocation failures
std::vector<uint8_t> compressUnsafe(const std::string& input) {
    z_stream strm{};
    deflateInit(&strm, Z_DEFAULT_COMPRESSION);

    strm.next_in = reinterpret_cast<Bytef*>(const_cast<char*>(input.data()));
    strm.avail_in = static_cast<uInt>(input.size());

    std::vector<uint8_t> compressed;
    std::vector<uint8_t> outBuffer(4096);

    do {
        strm.next_out = outBuffer.data();
        strm.avail_out = outBuffer.size();

        deflate(&strm, Z_NO_FLUSH);
        size_t written = outBuffer.size() - strm.avail_out;

        // If std::vector::insert fails (std::bad_alloc due to memory limits),
        // execution escapes this function block.
        // deflateEnd(&strm) is skipped, causing a persistent memory leak of 
        // zlib's internal LZ77 state arrays!
        compressed.insert(compressed.end(), outBuffer.begin(), outBuffer.begin() + written);
    } while (strm.avail_out == 0);

    deflateEnd(&strm); // Never reached if line above throws!
    return compressed;
}
\`\`\`

#### 🛡️ Safe C++ RAII Guard Solution:

To make your C++ applications rock-solid, wrap the \`z_stream\` lifecycle in an RAII class structure. Destructors run automatically when objects go out of scope, guaranteeing resource release.

Here is the compliant exception-safe C++ implementation code using modern standard \`std::span\` and dynamic buffer manipulation:

\`\`\`cpp
#include <iostream>
#include <string_view>
#include <vector>
#include <memory>
#include <span>
#include <stdexcept>
#include <iomanip>
#include <zlib.h>

// Safe Exception-Proof RAII Deflate Wrapper
class SafeZlibDeflateStream {
public:
    explicit SafeZlibDeflateStream(int level = Z_DEFAULT_COMPRESSION) {
        strm_.zalloc = Z_NULL;
        strm_.zfree = Z_NULL;
        strm_.opaque = Z_NULL;

        if (deflateInit(&strm_, level) != Z_OK) {
            throw std::runtime_error("zlib: Failed to initialize deflate stream");
        }
    }

    // Prohibit copy semantics to enforce unique state ownership
    SafeZlibDeflateStream(const SafeZlibDeflateStream&) = delete;
    SafeZlibDeflateStream& operator=(const SafeZlibDeflateStream&) = delete;

    // Support clean move semantics
    SafeZlibDeflateStream(SafeZlibDeflateStream&& other) noexcept : strm_(other.strm_) {
        other.strm_.state = nullptr; // invalidate the moved-from stream to prevent double-free
    }

    SafeZlibDeflateStream& operator=(SafeZlibDeflateStream&& other) noexcept {
        if (this != &other) {
            cleanup();
            strm_ = other.strm_;
            other.strm_.state = nullptr;
        }
        return *this;
    }

    ~SafeZlibDeflateStream() {
        cleanup();
    }

    z_stream& get() noexcept { return strm_; }

private:
    z_stream strm_{};

    void cleanup() noexcept {
        if (strm_.state != nullptr) {
            deflateEnd(&strm_);
            strm_.state = nullptr;
        }
    }
};

// Safe, C++20 structured memory-to-memory block compression helper
std::vector<uint8_t> compressModernCpp(std::span<const uint8_t> inputSource) {
    SafeZlibDeflateStream deflateStream(Z_DEFAULT_COMPRESSION);
    z_stream& strm = deflateStream.get();

    strm.next_in = const_cast<Bytef*>(inputSource.data());
    strm.avail_in = static_cast<uInt>(inputSource.size());

    std::vector<uint8_t> result;
    std::vector<uint8_t> tempBuffer(16384); // 16KB window chunks

    int status;
    do {
        strm.next_out = tempBuffer.data();
        strm.avail_out = static_cast<uInt>(tempBuffer.size());

        status = deflate(&strm, Z_FINISH);
        if (status == Z_STREAM_ERROR) {
            throw std::runtime_error("zlib: stream state corruption during deflation");
        }

        size_t written_length = tempBuffer.size() - strm.avail_out;
        
        // If allocation throws std::bad_alloc, SafeZlibDeflateStream's destructor is called automatically.
        // It safely releases all core resources inside deflateEnd()!
        result.insert(result.end(), tempBuffer.begin(), tempBuffer.begin() + written_length);
    } while (strm.avail_out == 0);

    if (status != Z_STREAM_END) {
        throw std::runtime_error("zlib: compression loop terminated before output finished");
    }

    return result;
}

int main() {
    std::string_view sourceText = "Excelsior! Safe modern code prevents resource leaks across critical layers.";
    try {
        // Safe, modern byte span casting 
        auto inputBytes = std::span<const uint8_t>(
            reinterpret_cast<const uint8_t*>(sourceText.data()), 
            sourceText.size()
        );

        auto compressed = compressModernCpp(inputBytes);
        std::cout << "Original length: " << sourceText.size() << " bytes\\n";
        std::cout << "Compressed length: " << compressed.size() << " bytes\\n";
    } catch (const std::exception& err) {
        std::cerr << "Application Exception: " << err.what() << std::endl;
    }
    return 0;
}
\`\`\`

To compile modern C++ code linking with zlib, run:

\`\`\`bash
# Compile C++17/C++20 modern binary
g++ -std=c++20 -O3 main.cpp -lz -o compress_cpp_binary
\`\`\`
`,
  },
  'quickstart-node': {
    id: 'quickstart-node',
    name: 'Quick Start: Node.js',
    category: 'Getting Started',
    type: 'guide',
    summary: 'A fast-track tutorial on using Node.js zlib features to compress files and handle generic HTTP compression streams.',
    description: `### Using zlib in Node.js

Node.js provides a robust \`zlib\` core module. It includes promise-based methods, callback-based utilities, and stream-based transformation classes (\`Gzip\`, \`Gunzip\`, \`Deflate\`, \`Inflate\`, \`BrotliCompress\`, \`BrotliDecompress\`).

---

### 1. One-Shot Compression (Buffer API)
Perfect for smaller inputs where streaming overhead outweighs convenience. It uses standard Node.js asynchronous style:

\`\`\`javascript
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

const text = "Compression simplifies file transmissions across networks.";

async function run() {
  try {
    // Compress buffer
    const compressed = await gzip(text);
    console.log(\`Original: \${text.length} bytes | Gzipped: \${compressed.length} bytes\`);

    // Decompress buffer
    const decompressed = await gunzip(compressed);
    console.log(\`Decompressed text: \${decompressed.toString()}\`);
  } catch (err) {
    console.error("Failed to process buffers", err);
  }
}
run();
\`\`\`

---

### 2. Streaming Files (Memory-Safe API)
Ideal for processing large archives, logs, or databases. Streaming processes blocks incrementally without loading the entire file into RAM.

\`\`\`javascript
import fs from 'fs';
import zlib from 'zlib';
import { pipeline } from 'stream/promises';

async function compressFile(inputPath, outputPath) {
  const source = fs.createReadStream(inputPath);
  const compressor = zlib.createGzip({ level: 9 }); // Level 9 is maximum compression
  const destination = fs.createWriteStream(outputPath);

  try {
    // pipeline handles automatic cleanup and error forwarding
    await pipeline(source, compressor, destination);
    console.log('File successfully gzipped!');
  } catch (error) {
    console.error('Streaming compression failed:', error);
  }
}
\`\`\`

---

### 3. Adding Gzip to custom Express Server
Modern browsers declare preferred encodings in the requests through the header \`Accept-Encoding: gzip, deflate, br\`. You can serve compressed payloads directly:

\`\`\`javascript
import express from 'express';
import zlib from 'zlib';

const app = express();

app.get('/api/large-json', (req, res) => {
  const rawData = {
    users: Array.from({ length: 1000 }, (_, i) => ({ id: i, name: \`User_\${i}\`, role: 'Developer' }))
  };
  const jsonString = JSON.stringify(rawData);

  // Check client compression support
  const acceptEncoding = req.headers['accept-encoding'] || '';

  if (acceptEncoding.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Type', 'application/json');
    
    // Inline compress and pipe stream
    zlib.gzip(jsonString, (err, buffer) => {
      if (err) return res.status(500).send("Compression error");
      res.send(buffer);
    });
  } else {
    // Fallback to standard
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonString);
  }
});
\`\`\`
`,
  },
  formats: {
    id: 'formats',
    name: 'Gzip vs Deflate vs Zlib',
    category: 'Getting Started',
    type: 'guide',
    summary: 'Clarifying the difference between raw DEFLATE raw payload, the zlib wrapper format, and the gzip file format.',
    description: `### Formats Compared

Many developers get confused between **DEFLATE**, **zlib**, and **gzip**. Although they all use the exact same underlying compression algorithm (DEFLATE), they wrap the resulting compressed stream in different container formats with varying header payloads and checksum safety guards.

| Feature | Raw DEFLATE | zlib Format | gzip Format |
| :--- | :--- | :--- | :--- |
| **Specification** | [RFC 1951](https://tools.ietf.org/html/rfc1951) | [RFC 1950](https://tools.ietf.org/html/rfc1950) | [RFC 1952](https://tools.ietf.org/html/rfc1952) |
| **Header Size** | 0 bytes | 2 - 6 bytes | 10+ bytes (variable) |
| **Footer Size** | 0 bytes | 4 bytes (Adler-32) | 8 bytes (CRC-32 + Length) |
| **Typical Use** | PNG, ZIP, PDF streams | Internal storage, Git, OpenSSL | Long-term files, HTTP downloads |
| **Content Type** | Direct stream | \`application/zlib\` | \`application/gzip\` |

---

### 1. Raw DEFLATE
- Contains **only** the compressed binary blocks.
- There are **no headers, magic bytes, or metadata** stating how large the uncompressed data is.
- No integrated checksums. If a byte corrupts, decoder might run indefinitely or crash without throwing errors.
- Created in zlib by initiating deflate with a negative window bit size parameter: e.g. \`windowBits = -15\`.

### 2. zlib Format
- A lightweight RFC 1950-compliant wrapper.
- **Header (2 bytes)**:
  - First byte: Compression Method & flags (typically \`0x78\` representing Method 8 DEFLATE with 32KB buffer window).
  - Second byte: Flags specifying preset dictionaries of bytes and fit checksum variables.
- **Footer (4 bytes)**:
  - Holds an **Adler-32** checksum of the original, uncompressed text. Adler-32 is much faster to calculate in software than standard cyclic CRC-32, making zlib ideal for high-speed network stream packaging.

### 3. Gzip Format
- An RFC 1952 container designed to encapsulate single individual files.
- **Header (10+ bytes)**:
  - Magic bytes (\`0x1f\`, \`0x8b\`).
  - Compression Method (\`8\` for deflate).
  - Flag byte specifying additional optional filename fields, comment headers, or extra parameters.
  - 4-byte Modification Time (Mtime) timestamp.
  - Operating system identifier.
- **Footer (8 bytes)**:
  - Holds a **CRC-32** checksum (robust error-checking) and the low-order 32 bits of the original uncompressed stream size (\`size modulo 2^32\`).
`,
  },
};

export const apiItems: DocItem[] = [
  // core stream types
  {
    id: 'z_stream',
    name: 'z_stream',
    category: 'Core Types',
    type: 'type',
    summary: 'The main controller structure used to hold stream metadata and context for deflate and inflate operations.',
    description: `The \`z_stream\` structure encapsulates all pointers to input/output buffers, free byte capacities, state flags, custom memory allocators, and internal state trackers for both compression and decompression.
    
All core APIs accept a pointer to standard \`z_stream\` instance (\`z_streamp\`). The caller is strictly responsible for allocating the structure, populating the input/output pointers, and adjusting available byte registers dynamically before calling stream functions.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// 1. Zero-initialize z_stream via aggregate list initialization to prevent garbage pointers
z_stream strm{}; 

// 2. Wire custom zlib allocations directly to modern C++ standard allocators
strm.zalloc = [](voidpf opaque, uInt items, uInt size) -> voidpf {
    try {
        return new std::byte[items * size];
    } catch (const std::bad_alloc&) {
        return Z_NULL;
    }
};
strm.zfree = [](voidpf opaque, voidpf address) noexcept {
    delete[] static_cast<std::byte*>(address);
};
\`\`\`

All pointer fields of the stream structure must never contain garbage allocations or invalid memory offsets.`,
    signature: `typedef struct z_stream_s {
    const Bytef *next_in;     /* next input byte */
    uInt         avail_in;    /* number of bytes available at next_in */
    uLong        total_in;    /* total number of input bytes read so far */

    Bytef       *next_out;    /* next output byte will go here */
    uInt         avail_out;   /* remaining free space at next_out */
    uLong        total_out;   /* total number of bytes output so far */

    const char  *msg;         /* last error message, NULL if no error */
    struct internal_state FAR *state; /* not visible to applications */

    alloc_func   zalloc;      /* used to allocate the internal state */
    free_func    zfree;       /* used to free the internal state */
    voidpf       opaque;      /* private data object passed to zalloc/zfree */

    int          data_type;   /* best guess about the data type (text or binary) */
    uLong        adler;       /* Adler-32 or CRC-32 checksum value */
    uLong        reserved;    /* reserved for future use */
} z_stream;`,
    parameters: [
      { name: 'next_in', type: 'const Bytef*', description: 'Pointer to the start of unprocessed stream input buffer bytes.' },
      { name: 'avail_in', type: 'uInt', description: 'Size of buffer in bytes present at next_in.' },
      { name: 'next_out', type: 'Bytef*', description: 'Pointer to empty segment destined for compressed/decompressed output.' },
      { name: 'avail_out', type: 'uInt', description: 'Available write space remaining in the next_out buffer. Must be non-zero to execute step.' }
    ],
    equivalents: [
      { language: 'Node.js', code: '// Node equivalent uses stream wrapper objects instead\nimport zlib from "zlib";\nconst deflateStream = zlib.createDeflate();' }
    ]
  },

  // basic functions
  {
    id: 'deflateInit',
    name: 'deflateInit',
    category: 'Basic Stream API',
    type: 'function',
    summary: 'Initializes a zlib compression stream container with default parameters.',
    description: `Allocates and configures internal state trees inside the \`z_stream\` parameter for generic compression. It sets up dynamic LZ77 lookahead lists and allocates Huffman sliding arrays.
    
This operates as a convenience macro binding to \`deflateInit_()\` with current header version strings and structural size validation variables.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Bind initialization and mandatory cleanup within an exception-safe RAII wrapper
class ZlibDeflateStream {
    z_stream strm_{};
    bool active_ = false;
public:
    ZlibDeflateStream(int level = Z_DEFAULT_COMPRESSION) {
        if (deflateInit(&strm_, level) != Z_OK) {
            throw std::runtime_error("Failed to initialize deflate stream");
        }
        active_ = true;
    }
    ~ZlibDeflateStream() noexcept {
        if (active_) {
            deflateEnd(&strm_);
        }
    }
};
\`\`\``,
    signature: `int deflateInit (z_streamp strm, int level);`,
    parameters: [
      { name: 'strm', type: 'z_streamp', description: 'Pointer to the client-allocated z_stream structure.' },
      { name: 'level', type: 'int', description: 'Compression quality metric. Value ranges of Z_DEFAULT_COMPRESSION (-1), Z_NO_COMPRESSION (0), Z_BEST_SPEED (1) up to Z_BEST_COMPRESSION (9).' }
    ],
    returns: {
      type: 'int',
      description: 'Z_OK on success. Returns Z_MEM_ERROR if memory allocation failed, Z_STREAM_ERROR if parameter is invalid, or Z_VERSION_ERROR if library headers do not match runtime compiled executable.'
    },
    equivalents: [
      { language: 'Node.js', code: 'import zlib from "zlib";\n// Allocates deflate object\nconst stream = zlib.createDeflate({ level: zlib.constants.Z_DEFAULT_COMPRESSION });' }
    ],
    relatedIds: ['deflate', 'deflateEnd', 'deflateInit2']
  },
  {
    id: 'deflate',
    name: 'deflate',
    category: 'Basic Stream API',
    type: 'function',
    summary: 'Pipes source buffer items to generate compressed output payloads.',
    description: `Examines inputs in the \`strm->next_in\` workspace, compiles the DEFLATE search, encodes literals and offset tokens, and pipes outcomes to \`strm->next_out\`.
    
You must run \`deflate()\` in a loop until it returns \`Z_STREAM_END\` or all available bytes are compressed. The function dynamically reduces \`avail_in\` and \`avail_out\` and advances the \`next_in\` and \`next_out\` indices as it compiles.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Use C++20 standard bounds-checked std::span rather than raw C pointers
std::vector<uint8_t> compress_chunk(std::span<const uint8_t> input) {
    z_stream strm{};
    deflateInit(&strm, Z_DEFAULT_COMPRESSION);

    strm.next_in = const_cast<Bytef*>(input.data());
    strm.avail_in = static_cast<uInt>(input.size());

    std::vector<uint8_t> output;
    std::vector<uint8_t> chunk(4096);

    while (strm.avail_in > 0) {
        strm.next_out = chunk.data();
        strm.avail_out = chunk.size();
        
        deflate(&strm, Z_NO_FLUSH);
        
        size_t written = chunk.size() - strm.avail_out;
        output.insert(output.end(), chunk.begin(), chunk.begin() + written);
    }
    deflateEnd(&strm);
    return output;
}
\`\`\``,
    signature: `int deflate (z_streamp strm, int flush);`,
    parameters: [
      { name: 'strm', type: 'z_streamp', description: 'Pointer to the pre-initialized z_stream state container.' },
      { name: 'flush', type: 'int', description: 'Allows controlling stream flushes. Options: Z_NO_FLUSH (allows buffering), Z_SYNC_FLUSH (outputs all pending data), Z_FULL_FLUSH (cleans sliding history), or Z_FINISH (forces calculation termination).' }
    ],
    returns: {
      type: 'int',
      description: 'Z_OK if progress was made. Z_STREAM_END if Z_FINISH flush was processed and output is complete. Z_STREAM_ERROR if state structure is inconsistent or corrupted, or Z_BUF_ERROR if output space ran dry under specific conditions.'
    },
    relatedIds: ['deflateInit', 'deflateEnd']
  },
  {
    id: 'deflateEnd',
    name: 'deflateEnd',
    category: 'Basic Stream API',
    type: 'function',
    summary: 'Frees internal stream allocations and tears down state lists.',
    description: `Safely deallocates any dynamically created LZ77 lookahead slides, sliding buffer blocks, and tree objects. It does not delete the master \`z_stream\` container itself, which remains controlled by the client scope.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Bind zlib cleanup automatic routines safely to smart pointers
struct ZStreamDeleter {
    void operator()(z_stream* ptr) const noexcept {
        if (ptr) {
            deflateEnd(ptr);
            delete ptr;
        }
    }
};
using SafeZStreamPtr = std::unique_ptr<z_stream, ZStreamDeleter>;
\`\`\``,
    signature: `int deflateEnd (z_streamp strm);`,
    parameters: [
      { name: 'strm', type: 'z_streamp', description: 'Pointer to active z_stream instance to be closed.' }
    ],
    returns: {
      type: 'int',
      description: 'Z_OK if clean. Returns Z_STREAM_ERROR if strm is null or its internal pointer was corrupted.'
    },
    relatedIds: ['deflateInit', 'deflate']
  },
  {
    id: 'inflateInit',
    name: 'inflateInit',
    category: 'Basic Stream API',
    type: 'function',
    summary: 'Initializes a decompression stream with generic parameters.',
    description: `Configures internal code book tables and allocation slides for decoding RFC 1950 zlib-wrapped byte streams. No window attributes can be customized via this simple macro.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Wrapping decompressor lifecycles recursively in C++ RAII guardians
class ZlibDecompressStream {
    z_stream strm_{};
    bool active_ = false;
public:
    ZlibDecompressStream() {
        if (inflateInit(&strm_) != Z_OK) {
            throw std::runtime_error("zlib: inflateInit failed");
        }
        active_ = true;
    }
    ~ZlibDecompressStream() noexcept {
        if (active_) {
            inflateEnd(&strm_);
        }
    }
};
\`\`\``,
    signature: `int inflateInit (z_streamp strm);`,
    parameters: [
      { name: 'strm', type: 'z_streamp', description: 'Pointer to stream object destined for decompression use.' }
    ],
    returns: {
      type: 'int',
      description: 'Z_OK on success. Returns Z_MEM_ERROR if memory failed, Z_VERSION_ERROR if library mismatch occurred, or Z_STREAM_ERROR if initialized state pointer is invalid.'
    },
    relatedIds: ['inflate', 'inflateEnd', 'inflateInit2']
  },
  {
    id: 'inflate',
    name: 'inflate',
    category: 'Basic Stream API',
    type: 'function',
    summary: 'Processes compressed input flows into standard uncompressed bytes.',
    description: `Reads RFC 1950 blocks from \`strm->next_in\`, expands matches and translates Huffman tree tokens, and outputs literal stream indices to \`strm->next_out\`.
    
Must be executed in a loop. When it arrives at end of block wraps, verify if Adler32 match corresponds and returns \`Z_STREAM_END\`.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Implement Zip-Bomb protection capping maximum uncompressed size bounds
constexpr size_t MAX_DECOMPRESSION_CEILING = 100 * 1024 * 1024; // 100MB max limit

std::vector<uint8_t> safe_decompress(std::span<const uint8_t> compressed) {
    z_stream strm{};
    inflateInit(&strm);
    strm.next_in = const_cast<Bytef*>(compressed.data());
    strm.avail_in = static_cast<uInt>(compressed.size());

    std::vector<uint8_t> decompressed;
    std::vector<uint8_t> buffer(16384);

    while (strm.avail_in > 0) {
        strm.next_out = buffer.data();
        strm.avail_out = buffer.size();
        
        int status = inflate(&strm, Z_NO_FLUSH);
        if (status < 0) {
            inflateEnd(&strm);
            throw std::runtime_error("Decompression failed");
        }
        
        size_t written = buffer.size() - strm.avail_out;
        if (decompressed.size() + written > MAX_DECOMPRESSION_CEILING) {
            inflateEnd(&strm);
            throw std::runtime_error("Decompression limit exceeded (zip bomb protection)!");
        }
        decompressed.insert(decompressed.end(), buffer.begin(), buffer.begin() + written);
    }
    inflateEnd(&strm);
    return decompressed;
}
\`\`\``,
    signature: `int inflate (z_streamp strm, int flush);`,
    parameters: [
      { name: 'strm', type: 'z_streamp', description: 'Decompressor stream state pointer.' },
      { name: 'flush', type: 'int', description: 'Options: Z_NO_FLUSH, Z_SYNC_FLUSH, Z_FINISH, Z_BLOCK. Unlike deflate, you do not need Z_FINISH to complete decompression; just use Z_NO_FLUSH or Z_SYNC_FLUSH.' }
    ],
    returns: {
      type: 'int',
      description: 'Z_OK on forward movement. Z_STREAM_END if payload fully extracted. Z_NEED_DICT if preset dictionary required. Z_DATA_ERROR if block CRC/checksum fails or gzip formats are compromised. Z_MEM_ERROR on malloc failures.'
    },
    relatedIds: ['inflateInit', 'inflateEnd']
  },
  {
    id: 'inflateEnd',
    name: 'inflateEnd',
    category: 'Basic Stream API',
    type: 'function',
    summary: 'Closes decompressor queues and frees table indices.',
    description: `Tears down all dynamically loaded Huffman table registers and frees internal sliding buffers, completing the stream lifecycle.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Use custom RAII destructors to safely encapsulate inflateEnd freeing pipelines
struct InflateDeleter {
    void operator()(z_stream* strm) const noexcept {
        if (strm) {
            inflateEnd(strm);
            delete strm;
        }
    }
};
\`\`\``,
    signature: `int inflateEnd (z_streamp strm);`,
    parameters: [
      { name: 'strm', type: 'z_streamp', description: 'Pointer to active decompressor z_stream.' }
    ],
    returns: {
      type: 'int',
      description: 'Z_OK on clean tear down; Z_STREAM_ERROR if input structures are null.'
    },
    relatedIds: ['inflateInit', 'inflate']
  },

  // advanced APIs
  {
    id: 'deflateInit2',
    name: 'deflateInit2',
    category: 'Advanced Stream API',
    type: 'function',
    summary: 'Advanced compression initializer allowing complete customization of header types, memory footprint, and algorithms.',
    description: `The standard workhorse parameterization in advanced environments. It allows choosing:
- Header output format: raw DEFLATE, standard zlib wrapper, or gzip wrapper.
- Sliding window size in bytes.
- Internal tree matching speeds and memory budgets.
- Target heuristics (like Run-Length Encoding filter, static Huffman only, or text-oriented tuning).

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Enforce strong typing with C++ enum class wrappers to prevent bug parameters
enum class CompressionLevel : int { None = 0, Speed = 1, Default = -1, Best = 9 };
enum class StreamFormat : int { Raw = -15, Zlib = 15, Gzip = 15 + 16 };

void safe_init_deflate2(z_stream& strm, CompressionLevel lvl, StreamFormat fmt) {
    int ret = deflateInit2(
        &strm, 
        static_cast<int>(lvl), 
        Z_DEFLATED, 
        static_cast<int>(fmt), 
        8, // MemLevel
        Z_DEFAULT_STRATEGY
    );
    if (ret != Z_OK) {
        throw std::runtime_error("zlib: deflateInit2 failure: " + std::to_string(ret));
    }
}
\`\`\``,
    signature: `int deflateInit2 (z_streamp strm, int level, int method, int windowBits, int memLevel, int strategy);`,
    parameters: [
      { name: 'strm', type: 'z_streamp', description: 'Pointer to stream struct.' },
      { name: 'level', type: 'int', description: '0 (no compression) to 9 (maximum compression).' },
      { name: 'method', type: 'int', description: 'Must be Z_DEFLATED (8).' },
      { name: 'windowBits', type: 'int', description: 'Base 2 logarithm of history window. Default is 15 (32KB). Range: 8-15. Add 16 to write standard GZip headers (e.g. 15+16=31). Pass negative value for Raw Deflate (e.g. -15).' },
      { name: 'memLevel', type: 'int', description: 'A metric between 1 and 9 specifying memory allocations for state lists. Default is 8.' },
      { name: 'strategy', type: 'int', description: 'Compression filters: Z_DEFAULT_STRATEGY, Z_FILTERED, Z_HUFFMAN_ONLY, Z_RLE, or Z_FIXED (disables dynamic Huffman).' }
    ],
    returns: {
      type: 'int',
      description: 'Z_OK if succeeds. Z_STREAM_ERROR if values are out-of-bounds. Z_MEM_ERROR if memory boundaries are broken.'
    },
    equivalents: [
      { language: 'Node.js', code: 'import zlib from "zlib";\n// Setting custom fields in Node\nconst gzipStream = zlib.createGzip({\n  level: 9,\n  windowBits: 15 + 16,\n  memLevel: 8,\n  strategy: zlib.constants.Z_DEFAULT_STRATEGY\n});' }
    ],
    relatedIds: ['deflateInit', 'inflateInit2']
  },
  {
    id: 'inflateInit2',
    name: 'inflateInit2',
    category: 'Advanced Stream API',
    type: 'function',
    summary: 'Decompresses with custom window size or auto-detects gzip/zlib wrappers simultaneously.',
    description: `Allows custom buffer window allocation configuration.
    
Passing \`windowBits = 15 + 32\` instructs inflate to automatically detect whether the incoming buffer is formatted in standard Gzip (RFC 1952) or standard zlib (RFC 1950) depending on the magic visual signatures.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Use C++20 structured exceptions with inflateInit2 multi-format header probing
void safe_init_inflate2(z_stream& strm) {
    // Pass (15 + 32) window bits to enable automatic gzip and zlib detection
    int ret = inflateInit2(&strm, 15 + 32);
    if (ret != Z_OK) {
        throw std::runtime_error("zlib: inflateInit2 failed to initialize parser");
    }
}
\`\`\``,
    signature: `int inflateInit2 (z_streamp strm, int windowBits);`,
    parameters: [
      { name: 'strm', type: 'z_streamp', description: 'Pointer to decompressor stream.' },
      { name: 'windowBits', type: 'int', description: 'Logarithmic sliding range (8-15). Gzip detection enabled if 16-31. Multi-format container automatic mapping enabled if increased by +32.' }
    ],
    returns: {
      type: 'int',
      description: 'Z_OK on success, errors otherwise.'
    },
    relatedIds: ['inflateInit', 'deflateInit2']
  },
  {
    id: 'deflateSetHeader',
    name: 'deflateSetHeader',
    category: 'Advanced Stream API',
    type: 'function',
    summary: 'Specifies gzip metadata tags inside a pending Gzip payload container.',
    description: `Enables writing detailed filesystem metadata (such as modification timestamps, absolute filenames, and arbitrary file comments) inside standard gzip output streams.
    
Must be executed after calling \`deflateInit2()\` (with Gzip bits setting) but BEFORE running the first \`deflate()\` process action.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Maintain filename / comment allocation lifetimes inside container objects
struct SafeGzipMetadataWriter {
    z_stream strm{};
    gz_header header{};
    std::string safe_filename; // Guarantees backing buffer lifetime
    std::string safe_comment;  // Guarantees backing buffer lifetime

    void register_header(std::string_view filename, std::string_view comment) {
        safe_filename = filename;
        safe_comment = comment;
        
        header.name = reinterpret_cast<Bytef*>(safe_filename.data());
        header.comment = reinterpret_cast<Bytef*>(safe_comment.data());
        
        if (deflateSetHeader(&strm, &header) != Z_OK) {
            throw std::runtime_error("zlib: Failed to bind metadata headers");
        }
    }
};
\`\`\``,
    signature: `int deflateSetHeader (z_streamp strm, gz_headerp head);`,
    parameters: [
      { name: 'strm', type: 'z_streamp', description: 'Gzip active stream pointer.' },
      { name: 'head', type: 'gz_headerp', description: 'A structure holding target text tags, comment arrays, operating system IDs, and timestamp numbers.' }
    ],
    returns: {
      type: 'int',
      description: 'Z_OK if headers are successfully loaded.'
    }
  },

  // helper utilities
  {
    id: 'compress',
    name: 'compress',
    category: 'Utility Functions',
    type: 'function',
    summary: 'One-shot compression utility that processes a full buffer in a single step.',
    description: `Avoids the overhead of managing a \`z_stream\` structure manually by instantiating, execution, and tearing down standard routines internally.
    
The destination buffer must compile with sufficient spacing safely. Minimum bounds recommendation is: \`destLen = sourceLen + (sourceLen >> 12) + (sourceLen >> 14) + (sourceLen >> 25) + 13\`. Or use \`compressBound()\` directly to determine space requirement.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Modern memory-safe helper utilizing std::span on one-shot compress
std::vector<uint8_t> compress_oneshot(std::span<const uint8_t> src) {
    uLong dest_size = compressBound(src.size());
    std::vector<uint8_t> output(dest_size);
    uLongf written_bytes = dest_size;

    int ret = compress(output.data(), &written_bytes, src.data(), src.size());
    if (ret != Z_OK) {
        throw std::runtime_error("zlib: Compression error code: " + std::to_string(ret));
    }
    output.resize(written_bytes);
    return output;
}
\`\`\``,
    signature: `int compress (Bytef *dest, uLongf *destLen, const Bytef *source, uLong sourceLen);`,
    parameters: [
      { name: 'dest', type: 'Bytef*', description: 'Buffer targeted to write compressed parameters.' },
      { name: 'destLen', type: 'uLongf*', description: 'Input pointer holds size of dest. Upon returning, zlib updates the pointer to the exact number of bytes written.' },
      { name: 'source', type: 'const Bytef*', description: 'Input data pointer.' },
      { name: 'sourceLen', type: 'uLong', description: 'Size of source buffer in bytes.' }
    ],
    returns: {
      type: 'int',
      description: 'Z_OK if ok. Z_MEM_ERROR if memory buffer allocations failed. Z_BUF_ERROR if dest layout cannot hold outputs.'
    },
    equivalents: [
      { language: 'Node.js', code: 'import zlib from "zlib";\n// Fast synchronous one shot\nconst compressed = zlib.deflateSync(buffer);' }
    ],
    relatedIds: ['uncompress', 'compressBound']
  },
  {
    id: 'uncompress',
    name: 'uncompress',
    category: 'Utility Functions',
    type: 'function',
    summary: 'One-shot decompression utility that expands a compressed buffer in a single step.',
    description: `One-shot wrapper encapsulating the entire \`inflate\` stream operations on a source block. Expects input to contain RFC 1950 header formats.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Clean memory sizing loop resolving dynamic destination sizes safely
std::vector<uint8_t> uncompress_oneshot(std::span<const uint8_t> src, size_t estimated_size) {
    std::vector<uint8_t> dest(estimated_size);
    uLongf dest_len = dest.size();

    int ret;
    while ((ret = uncompress(dest.data(), &dest_len, src.data(), src.size())) == Z_BUF_ERROR) {
        dest.resize(dest.size() * 2); // grow output buffer exponentially
        dest_len = dest.size();
    }
    
    if (ret != Z_OK) {
        throw std::runtime_error("zlib: Uncompress failure code: " + std::to_string(ret));
    }
    dest.resize(dest_len);
    return dest;
}
\`\`\``,
    signature: `int uncompress (Bytef *dest, uLongf *destLen, const Bytef *source, uLong sourceLen);`,
    parameters: [
      { name: 'dest', type: 'Bytef*', description: 'Buffer mapped to hold uncompressed outputs.' },
      { name: 'destLen', type: 'uLongf*', description: 'Input holds maximum sizing. Output contains exact byte size written.' },
      { name: 'source', type: 'const Bytef*', description: 'Incoming compressed stream sequence.' },
      { name: 'sourceLen', type: 'uLong', description: 'Length of input stream buffer.' }
    ],
    returns: {
      type: 'int',
      description: 'Z_OK if success. Z_DATA_ERROR if stream format is invalid or checksum validation failed.'
    },
    relatedIds: ['compress']
  },
  {
    id: 'compressBound',
    name: 'compressBound',
    category: 'Utility Functions',
    type: 'function',
    summary: 'Calculates the absolute maximum payload buffer size required to compress a given length safely.',
    description: `Runs dry-run equation models regarding worst-case scenario expansion ratios (where content contains zero repetitiveness, causing Huffman overheads to compile slightly larger results).

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Secure bound assessment preventing undersized vector assertions
size_t compute_allocation_needs(size_t input_len) {
    uLong max_capacity = compressBound(static_cast<uLong>(input_len));
    if (max_capacity == 0) [[unlikely]] {
        throw std::overflow_error("zlib: input parameters exceeds limits");
    }
    return max_capacity;
}
\`\`\``,
    signature: `uLong compressBound (uLong sourceLen);`,
    parameters: [
      { name: 'sourceLen', type: 'uLong', description: 'Length of input bytes.' }
    ],
    returns: {
      type: 'uLong',
      description: 'Maximum buffer bounds size necessary to safely handle standard output pointers without Z_BUF_ERROR risks.'
    }
  },

  // file gzip utilities
  {
    id: 'gzopen',
    name: 'gzopen',
    category: 'Gzip File I/O',
    type: 'function',
    summary: 'Opens a gzip (.gz) file for reading, writing, or appending.',
    description: `Provides a stream interface mimicking the POSIX C library stdio \`fopen()\` function, but pipes text contents automatically through an integrated encoder or decoder.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Manage gzip files using exceptional RAII smart boundaries safely
struct GzFileDeleter {
    void operator()(gzFile f) const noexcept {
        if (f) gzclose(f);
    }
};
using SafeGzFile = std::unique_ptr<std::remove_pointer_t<gzFile>, GzFileDeleter>;

SafeGzFile open_gzip_safe(const std::filesystem::path& p, const char* mode) {
    SafeGzFile file(gzopen(p.string().c_str(), mode));
    if (!file) {
        throw std::runtime_error("C++ system: Failed to open Gzip file " + p.string());
    }
    return file;
}
\`\`\``,
    signature: `gzFile gzopen (const char *path, const char *mode);`,
    parameters: [
      { name: 'path', type: 'const char*', description: 'Absolute or relative filesystem file path.' },
      { name: 'mode', type: 'const char*', description: '"r" (read mode), "w" (write mode - truncates files), "a" (append mode). Append integers to select compression levels, e.g., "wb9" (write highest quality) or "wb1h" (only use huffman strategy).' }
    ],
    returns: {
      type: 'gzFile',
      description: 'Pointer to file wrapper structure. Returns NULL if the stream cannot be initialized or the file path represents an inaccessible sector.'
    },
    relatedIds: ['gzread', 'gzwrite', 'gzclose']
  },
  {
    id: 'gzread',
    name: 'gzread',
    category: 'Gzip File I/O',
    type: 'function',
    summary: 'Reads uncompressed bytes from a gzip file, decompressing transparently.',
    description: `Decodes and extracts content blocks on-the-fly and loads the resulting stream directly into standard memory buffers.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Decompress from gzip files safely directly into structured C++ std::vector
std::vector<uint8_t> read_gzip_completely(gzFile file, size_t final_size) {
    std::vector<uint8_t> output(final_size);
    int bytes_read = gzread(file, output.data(), static_cast<unsigned>(output.size()));
    if (bytes_read < 0) {
        throw std::runtime_error("zlib read error " + std::to_string(bytes_read));
    }
    output.resize(bytes_read);
    return output;
}
\`\`\``,
    signature: `int gzread (gzFile file, voidp buf, unsigned len);`,
    parameters: [
      { name: 'file', type: 'gzFile', description: 'File pointer returned by gzopen.' },
      { name: 'buf', type: 'voidp', description: 'Destination buffer for decompressed outputs.' },
      { name: 'len', type: 'unsigned', description: 'Number of uncompressed bytes to draw.' }
    ],
    returns: {
      type: 'int',
      description: 'Uncompressed bytes actually written to buf. Returns 0 if end of file reached, or negative integers if decompression/corrupted sectors are detected.'
    }
  },
  {
    id: 'gzwrite',
    name: 'gzwrite',
    category: 'Gzip File I/O',
    type: 'function',
    summary: 'Compresses and writes byte arrays directly into a gzip formatted file.',
    description: `Wrapper receiving plain buffers, wrapping with appropriate RFC 1952 headers, compressing with deflators, and executing file pipe operations automatically.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Prevent size mismatch errors by piping safe standard views or spans
void write_gzip_completely(gzFile file, std::string_view data) {
    int written = gzwrite(file, data.data(), static_cast<unsigned>(data.size()));
    if (written != static_cast<int>(data.size())) {
        throw std::runtime_error("zlib segment write incomplete or disk is full!");
    }
}
\`\`\``,
    signature: `int gzwrite (gzFile file, voidpc buf, unsigned len);`,
    parameters: [
      { name: 'file', type: 'gzFile', description: 'Active gzip file pointer opened with write/append mode.' },
      { name: 'buf', type: 'voidpc', description: 'Source buffer holding uncompressed bytes.' },
      { name: 'len', type: 'unsigned', description: 'Stream buffer sizing specification.' }
    ],
    returns: {
      type: 'int',
      description: 'The number of uncompressed bytes written. Returns 0 if error occurred.'
    }
  },
  {
    id: 'gzclose',
    name: 'gzclose',
    category: 'Gzip File I/O',
    type: 'function',
    summary: 'Flushes and closes a gzip file descriptor.',
    description: `Guarantees all pending bits are written and trailers (CRC-32 checksum and uncompressed files size totals) are correctly appended prior to OS file descriptor shutdowns.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Encapsulate gzclose directly inside RAII scopes to clean handles during unwinding
class GzFileStreamGuard {
    gzFile file_ = nullptr;
public:
    explicit GzFileStreamGuard(gzFile f) : file_(f) {}
    ~GzFileStreamGuard() noexcept {
        if (file_) {
            gzclose(file_);
        }
    }
};
\`\`\``,
    signature: `int gzclose (gzFile file);`,
    parameters: [
      { name: 'file', type: 'gzFile', description: 'Gzip file structure to terminate.' }
    ],
    returns: {
      type: 'int',
      description: 'Returns Z_OK if the stream was flushed and closed successfully. Returns other zlib failure integers if error occurred on flushing.'
    }
  },

  // checksums
  {
    id: 'adler32',
    name: 'adler32',
    category: 'Checksum Functions',
    type: 'function',
    summary: 'Calculates the Adler-32 checksum metric of a buffer sequence.',
    description: `Adler-32 is much faster to compute in software than traditional CRC-32 checksum routines. It computes two 16-bit sums stacked together inside a 32-bit register.
    
If passing a pointer initialized to NULL in source, this returns the correct initial default Adler variable representation (value is \`1\`).

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Calculate transparently over C++20 structured spans
uint32_t calculate_adler32(uint32_t current_seed, std::span<const uint8_t> data) {
    return static_cast<uint32_t>(adler32(current_seed, data.data(), static_cast<uInt>(data.size())));
}
\`\`\``,
    signature: `uLong adler32 (uLong adler, const Bytef *buf, uInt len);`,
    parameters: [
      { name: 'adler', type: 'uLong', description: 'Previous running Adler value. Supply 1L (or 1) for the first call.' },
      { name: 'buf', type: 'const Bytef*', description: 'Target data array to scan.' },
      { name: 'len', type: 'uInt', description: 'Length of buf array.' }
    ],
    returns: {
      type: 'uLong',
      description: 'Calculated 32-bit Adler-32 checksum value.'
    },
    equivalents: [
      { language: 'Node.js', code: 'import zlib from "zlib";\n// Dynamic calculation is not natively exported in zlib standard node library,\n// but can be implemented in JS since it is straightforward.' }
    ],
    relatedIds: ['crc32']
  },
  {
    id: 'crc32',
    name: 'crc32',
    category: 'Checksum Functions',
    type: 'function',
    summary: 'Calculates the CRC-32 cyclic redundancy checksum of a buffer.',
    description: `Generates a compliant ISO-3309 cyclic remainder checksum, providing stronger mathematical guarantees against multi-bit transmission alterations than Adler-32.
    
Pass pointer NULL to initialize initial seed state variable (value is \`0\`).

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Stream blocks of crc32 cycles over C++ collections securely
uint32_t file_crc32(uint32_t seed, std::span<const uint8_t> buffer_stream) {
    return static_cast<uint32_t>(crc32(seed, buffer_stream.data(), static_cast<uInt>(buffer_stream.size())));
}
\`\`\``,
    signature: `uLong crc32 (uLong crc, const Bytef *buf, uInt len);`,
    parameters: [
      { name: 'crc', type: 'uLong', description: 'Previous running CRC checksum. Pass 0L for the first block.' },
      { name: 'buf', type: 'const Bytef*', description: 'Input stream buffer pointer.' },
      { name: 'len', type: 'uInt', description: 'Buffer size in bytes.' }
    ],
    returns: {
      type: 'uLong',
      description: 'The calculated 32-bit CRC cyclic checksum value.'
    },
    relatedIds: ['adler32']
  }
];

export const constantsAndTypes: DocItem[] = [
  {
    id: 'Z_OK',
    name: 'Z_OK',
    category: 'Constants',
    type: 'constant',
    summary: 'Represents successful operation verification.',
    description: `Value: \`0\`. Returned by almost all zlib functions as verification code upon completing steps without anomalies.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Return modern C++23 std::expected instead of loose result code integers
#include <expected>
enum class ZlibStatus : int { Success = Z_OK, Corruption = Z_DATA_ERROR };
std::expected<std::vector<uint8_t>, ZlibStatus> execute_zlib_step();
\`\`\``,
  },
  {
    id: 'Z_STREAM_END',
    name: 'Z_STREAM_END',
    category: 'Constants',
    type: 'constant',
    summary: 'Signal that the compression or decompression operations are fully completed.',
    description: `Value: \`1\`. Returned by \`deflate()\` when \`flush\` is set to \`Z_FINISH\` and all compressed bytes are processed. Returned by \`inflate()\` when it detects the footer CRC checksum validation point of the stream wrapper.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Check explicitly in decompression limits loops for completion endpoints
while (status != Z_STREAM_END) {
    status = inflate(&strm, Z_NO_FLUSH);
    if (status == Z_STREAM_ERROR || status == Z_DATA_ERROR) {
        throw std::runtime_error("zlib stream parse failed");
    }
}
\`\`\``,
  },
  {
    id: 'Z_NEED_DICT',
    name: 'Z_NEED_DICT',
    category: 'Constants',
    type: 'constant',
    summary: 'Flags decompression failure requiring a preset dictionary.',
    description: `Value: \`2\`. Returned by \`inflate()\` if the incoming stream is compiled to expect a dynamic dictionary match. \`inflateSetDictionary()\` must be called with the correct lookup array to resume operations.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Bind dictionary vectors safely to protect address registries
std::vector<uint8_t> dict_buffer = load_context_dictionary();
if (status == Z_NEED_DICT) {
    inflateSetDictionary(&strm, dict_buffer.data(), dict_buffer.size());
}
\`\`\``,
  },
  {
    id: 'Z_STREAM_ERROR',
    name: 'Z_STREAM_ERROR',
    category: 'Constants',
    type: 'constant',
    summary: 'Core stream configuration context inconsistency failure.',
    description: `Value: \`-2\`. Returned if the \`z_stream\` state pointer is NULL, if internal window buffers are corrupted, or if an invalid flush state parameter is passed to \`deflate()\` or \`inflate()\`.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Terminate workflows on core context anomalies using logical exceptions
if (status == Z_STREAM_ERROR) {
    throw std::logic_error("Internal zlib structure or window size parameter was invalid!");
}
\`\`\``,
  },
  {
    id: 'Z_DATA_ERROR',
    name: 'Z_DATA_ERROR',
    category: 'Constants',
    type: 'constant',
    summary: 'Highlights that compressed input stream content is structurally corrupted or invalid.',
    description: `Value: \`-3\`. Deflator state is compromised, or decoders detect inconsistent sliding histories, Huffman code lengths, or footer checksum validations.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Deny corrupt streams immediately to preserve application sandbox rules
if (status == Z_DATA_ERROR) {
    throw std::runtime_error("Corrupted payload detected! Adler/CRC validation failed.");
}
\`\`\``,
  },
  {
    id: 'Z_MEM_ERROR',
    name: 'Z_MEM_ERROR',
    category: 'Constants',
    type: 'constant',
    summary: 'Memory allocation allocation limitations failure.',
    description: `Value: \`-4\`. Occurs if the system is starved of memory and cannot instantiate state Huffman arrays or sliding lookahead streams inside memory boundaries.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Bubble system allocations exhaust errors as standard bad_alloc exceptions
if (status == Z_MEM_ERROR) {
    throw std::bad_alloc();
}
\`\`\``,
  },
  {
    id: 'Z_BUF_ERROR',
    name: 'Z_BUF_ERROR',
    category: 'Constants',
    type: 'constant',
    summary: 'Indicates output space ran dry prior to final stream completions.',
    description: `Value: \`-5\`. Returned if \`deflate()\` or \`inflate()\` requires output buffers to write results, but client provided \`avail_out == 0\`. Not always fatal; you typically allocate more space, point \`next_out\` to the new block, reset \`avail_out\`, and retry.

#### 🛡️ Modern C++ Best Practices & Memory Safety:
\`\`\`cpp
// Resize output arrays dynamically to recover from buffer capacity blocks
while (status == Z_BUF_ERROR) {
    output_vector.resize(output_vector.size() * 2);
    strm.next_out = output_vector.data() + offset;
    strm.avail_out = output_vector.size() - offset;
    status = deflate(&strm, Z_NO_FLUSH);
}
\`\`\``,
  }
];

const allDocItems = [
  ...Object.values(guides),
  ...apiItems,
  ...constantsAndTypes
];

export function getDocItemById(id: string): DocItem | undefined {
  return allDocItems.find(item => item.id === id);
}

export function searchDocs(query: string): DocItem[] {
  if (!query) return [];
  const lowercaseQuery = query.toLowerCase().trim();

  // Score match weighting
  return allDocItems
    .map(item => {
      let score = 0;
      const nameLower = item.name.toLowerCase();
      const summaryLower = item.summary.toLowerCase();
      const descLower = item.description.toLowerCase();

      // Exact matches are heavy
      if (nameLower === lowercaseQuery) {
        score += 100;
      } else if (nameLower.startsWith(lowercaseQuery)) {
        score += 50;
      } else if (nameLower.includes(lowercaseQuery)) {
        score += 30;
      }

      // Inside categories/summary/descriptions
      if (item.category.toLowerCase().includes(lowercaseQuery)) {
        score += 15;
      }
      if (summaryLower.includes(lowercaseQuery)) {
        score += 10;
      }
      if (descLower.includes(lowercaseQuery)) {
        score += 5;
      }

      // Constants specific matching
      if (item.type === 'constant' && nameLower.includes(lowercaseQuery)) {
        score += 20;
      }

      return { item, score };
    })
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(res => res.item);
}

export const sidebarStructure: CategoryGroup[] = [
  {
    id: 'get-started',
    title: 'Getting Started',
    items: [
      { id: 'intro', name: 'Introduction to zlib', type: 'guide' },
      { id: 'install', name: 'Installation & Integration', type: 'guide' },
      { id: 'quickstart-cpp', name: 'Quick Start: C/C++', type: 'guide' },
      { id: 'quickstart-node', name: 'Quick Start: Node.js', type: 'guide' },
      { id: 'formats', name: 'Gzip vs Deflate vs Zlib', type: 'guide' },
      { id: 'playground', name: 'Interactive Playground', type: 'guide' }
    ]
  },
  {
    id: 'basic-api',
    title: 'Basic Stream API',
    items: [
      { id: 'deflateInit', name: 'deflateInit', type: 'function' },
      { id: 'deflate', name: 'deflate', type: 'function' },
      { id: 'deflateEnd', name: 'deflateEnd', type: 'function' },
      { id: 'inflateInit', name: 'inflateInit', type: 'function' },
      { id: 'inflate', name: 'inflate', type: 'function' },
      { id: 'inflateEnd', name: 'inflateEnd', type: 'function' }
    ]
  },
  {
    id: 'advanced-api',
    title: 'Advanced Stream API',
    items: [
      { id: 'deflateInit2', name: 'deflateInit2', type: 'function' },
      { id: 'inflateInit2', name: 'inflateInit2', type: 'function' },
      { id: 'deflateSetHeader', name: 'deflateSetHeader', type: 'function' }
    ]
  },
  {
    id: 'utilities',
    title: 'Utility Functions',
    items: [
      { id: 'compress', name: 'compress', type: 'function' },
      { id: 'uncompress', name: 'uncompress', type: 'function' },
      { id: 'compressBound', name: 'compressBound', type: 'function' }
    ]
  },
  {
    id: 'gzip-io',
    title: 'Gzip File I/O',
    items: [
      { id: 'gzopen', name: 'gzopen', type: 'function' },
      { id: 'gzread', name: 'gzread', type: 'function' },
      { id: 'gzwrite', name: 'gzwrite', type: 'function' },
      { id: 'gzclose', name: 'gzclose', type: 'function' }
    ]
  },
  {
    id: 'checksum-api',
    title: 'Checksum Functions',
    items: [
      { id: 'adler32', name: 'adler32', type: 'function' },
      { id: 'crc32', name: 'crc32', type: 'function' }
    ]
  },
  {
    id: 'types-constants-api',
    title: 'Types & Constants',
    items: [
      { id: 'z_stream', name: 'z_stream', type: 'type' },
      { id: 'Z_OK', name: 'Z_OK', type: 'constant' },
      { id: 'Z_STREAM_END', name: 'Z_STREAM_END', type: 'constant' },
      { id: 'Z_NEED_DICT', name: 'Z_NEED_DICT', type: 'constant' },
      { id: 'Z_STREAM_ERROR', name: 'Z_STREAM_ERROR', type: 'constant' },
      { id: 'Z_DATA_ERROR', name: 'Z_DATA_ERROR', type: 'constant' },
      { id: 'Z_MEM_ERROR', name: 'Z_MEM_ERROR', type: 'constant' },
      { id: 'Z_BUF_ERROR', name: 'Z_BUF_ERROR', type: 'constant' }
    ]
  }
];
