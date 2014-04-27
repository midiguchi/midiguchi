
source = File.readlines('README.src.md').map(&:chomp)

toc = []
links = {}

source.map! do |line|
  if line =~ /^## (.*) \{#(.*)\}/
    toc << %Q{* [#{$1}](##{$2})}
    links[$2] = $1
    %Q(## <a name="#{$2}"></a>#{$1})
  elsif line =~ /^### (.*) \{#(.*)\}/
    toc << %Q{    * [#{$1}](##{$2})}
    links[$2] = $1
    %Q(### <a name="#{$2}"></a>#{$1})
  else
    line
  end
end

source = source.join("\n")

source.gsub!(/\[\[#([^\]]+)\]\]/) do
  id = $1
  name = links.fetch(id)
  %Q([#{name}](##{id}))
end

source.gsub!('HERETOC', toc.join("\n") + "\n\n")

puts source

